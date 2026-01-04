<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Stripe\Stripe;
use Stripe\Charge;
use App\Models\Application;
use App\Services\FileUploadService;
use App\Services\DocumentAnalysisService;
use App\Services\RiskAssessmentService;
use App\Services\Neo4jService;
use App\Services\StripeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use App\Models\Startup;
use App\Models\User;
use App\Models\Proposal;
use App\Services\StartupService;

class ApplicationService
{
    private $fileUploadService;
    private $documentAnalysisService;
    private $riskAssessmentService;
    private $neo4jService;
    private $stripeService;
    private $startupService;

    public function __construct(
        FileUploadService $fileUploadService,
        DocumentAnalysisService $documentAnalysisService,
        RiskAssessmentService $riskAssessmentService,
        Neo4jService $neo4jService,
        StripeService $stripeService,
        StartupService $startupService
    ) {
        $this->fileUploadService = $fileUploadService;
        $this->documentAnalysisService = $documentAnalysisService;
        $this->riskAssessmentService = $riskAssessmentService;
        $this->neo4jService = $neo4jService;
        $this->stripeService = $stripeService;
        $this->startupService = $startupService;
    }

    /**
     * Submit application by selecting an existing proposal
     */
    public function submitApplication(int $proposal_id): array
    {
        try {
            // Get the proposal details
            $proposal = Proposal::findOrFail($proposal_id);

            // Validate proposal exists and has required fields
            if (!$proposal) {
                throw new \Exception('Proposal not found');
            }

            // Verify the proposal belongs to the authenticated startup
            $startup = $this->startupService->getCurrentStartup();

            if ($proposal->startup_id !== $startup->id) {
                throw new \Exception('Proposal does not belong to this startup');
            }

            // Validate that required fields are present
            if (empty($proposal->funding_amount)) {
                throw new \Exception('Proposal funding amount is required');
            }

            // Validate proposal status
            if ($proposal->status !== 'REVIEWED') {
                throw new \Exception('Proposal must be reviewed before creating an application');
            }

            // Create the application using proposal data
            $applicationData = [
                'proposal_id' => $proposal_id,
                'funding_amount' => $proposal->funding_amount,
                'funding_stage' => $proposal->funding_stage,
                'funding_purpose' => $proposal->funding_purpose,
                'status' => 'Await Review',
                'startup_id' => $startup->id,
            ];

            // Use database transaction to ensure data consistency
            $application = DB::transaction(function () use ($applicationData) {
                return Application::create($applicationData);
            });

            // Check if application was created successfully
            if (!$application || !$application->id) {
                throw new \Exception('Failed to create application record');
            }

            return [
                'success' => true,
                'message' => 'Application created successfully from proposal',
                'data' => [
                    'id' => $application->id,
                    'proposal_id' => $proposal_id,
                    'current_step' => 'risk_assessment',
                    'next_step' => 'investor_matching',
                    'funding_details' => [
                        'funding_amount' => $proposal->funding_amount,
                        'funding_stage' => $proposal->funding_stage,
                        'funding_purpose' => $proposal->funding_purpose,
                    ]
                ]
            ];
        } catch(\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create application from proposal',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Assess risk for an application
     */
    public function assessRisk(int $application_id): array
    {
        try {
            $application = Application::findOrFail($application_id);

            // Get startup quarterly revenue from stripe
            $startup = $this->startupService->getCurrentStartup();
            $stripe_id = $startup->stripe_id;
            $stripe_response = $this->stripeService->getQuarterlyRevenue($stripe_id);

            // Run sales prediction
            $prediction = $this->riskAssessmentService->predictSales($stripe_response['revenue_q1'], $stripe_response['revenue_q2'], $stripe_response['growth_rate']);

            // Validate prediction benchmarks and funding amount via service
            $evaluation = $this->riskAssessmentService->evaluateFundingLimit(
                $prediction['data']['prediction'] ?? 0,
                $stripe_response['revenue_q2'] ?? 0,
                (float)$application->proposal->funding_amount
            );

            $passes = $evaluation['pass'];
            if ($passes) {
                return [
                    'success' => true,
                    'message' => 'Risk assessment passed',
                    'data' => [
                        'application_id' => $application->id,
                        'current_step' => 'investor_matching',
                        'next_step' => 'completed',
                        'prediction' => $prediction,
                        'stripe_data' => $stripe_response,
                        'mrr' => $evaluation['mrr'],
                        'estimated_funding_amount' => $evaluation['estimated_funding_amount'],
                        'predicted_growth_rate' => round($evaluation['predicted_growth_rate'] * 100, 1) . '%'
                    ]
                ];
            } else {
                $application->status = 'Failed';
                $application->message = 'Requested funding amount exceeds estimated amount based on Monthly Recurring Revenue (MRR). We encourage you to continue growing your business and reapply when you have stronger revenue performance or consider a smaller funding amount that better matches your current financial position.';
                $application->save();

                return [
                    'success' => false,
                    'message' => 'Risk assessment failed - Requested funding amount exceeds estimated amount based on MRR multiples',
                    'data' => [
                        'application_id' => $application->id,
                        'current_step' => 'risk_assessment_failed',
                        'next_step' => null,
                        'prediction' => $prediction,
                        'stripe_data' => $stripe_response,
                        'mrr' => $evaluation['mrr'],
                        'estimated_funding_amount' => $evaluation['estimated_funding_amount'],
                        'predicted_growth_rate' => round($evaluation['predicted_growth_rate'] * 100, 1) . '%'
                    ]
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to assess risk',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Match investors for an application
     */
    public function matchInvestors(int $application_id): array
    {
        try {
            $application = Application::findOrFail($application_id);

            // Insert the application details into neo4j aura
            $neo4j_response = $this->neo4jService->insertApplicationToNeo4j($application_id);
            $neo4j_data = $neo4j_response['data'] ?? [];

            // The application will go through startup-investor matching  
            $matching_response = $this->neo4jService->matchStartupToInvestor($application_id);
            $matching_data = $matching_response['data'] ?? [];

            return [
                'success' => true,
                'message' => 'Investor matching completed',
                'data' => [
                    'application_id' => $application->id,
                    'current_step' => 'completed',
                    'neo4j_response' => $neo4j_data,
                    'matching_response' => $matching_data
                ]
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to match investors',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Select an investor for an application
     */
    public function selectInvestor(int $application_id, int $investor_id): Application
    {
        $application = Application::findOrFail($application_id);
        $application->investor_id = $investor_id;
        $application->save();

        return $application;
    }

    /**
     * Accept an application
     */
    public function acceptApplication(int $application_id, string $message): Application
    {
        $application = Application::findOrFail($application_id);
        $application->status = 'In Progress';
        $application->message = $message;
        $application->save();

        return $application;
    }

    /**
     * Reject an application
     */
    public function rejectApplication(int $application_id, string $message): Application
    {
        $application = Application::findOrFail($application_id);
        $application->status = 'Rejected';
        $application->message = $message;
        $application->save();

        return $application;
    }
}
