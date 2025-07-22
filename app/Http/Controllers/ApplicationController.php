<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Models\Agreement;
use App\Services\AgreementService;
use App\Services\FileUploadService;
use Illuminate\Support\Facades\Http;
use App\Services\ApplicationService;
use Illuminate\Support\Facades\DB;
use App\Services\Neo4jService;
use Illuminate\Support\Facades\Log;

class ApplicationController extends Controller
{
    private $fileUploadService;
    private $applicationService;
    private $neo4jService;
    public function __construct(FileUploadService $fileUploadService, ApplicationService $applicationService, Neo4jService $neo4jService)
    {
        $this->fileUploadService = $fileUploadService;
        $this->applicationService = $applicationService;
        $this->neo4jService = $neo4jService;
    }
    
    public function submitApplication(Request $request): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            $uploadResult = $this->fileUploadService->uploadToSupabase($request, 'business-proposal');
            
            //get startup quarterly revenue from stripe
            $stripe_id = auth()->user()->startups()->first()->stripe_id;
            $stripe_response = $this->applicationService->getQuarterlyRevenue($stripe_id);
            
            // Check if Stripe call failed
            if ($stripe_response->getStatusCode() !== 200) {
                throw new \Exception('Stripe revenue retrieval failed: ' . $stripe_response->getData(true)['message']);
            }
            $stripe_data = $stripe_response->getData(true);
            
            $prediction = $this->applicationService->predictSales($stripe_data['revenue_q1'], $stripe_data['revenue_q2'], $stripe_data['growth_rate']);
            if($prediction->getStatusCode() !== 200) {
                throw new \Exception('Sales prediction failed: ' . $prediction->getData(true)['message']);
            }
            $prediction_data = $prediction->getData(true);
            
            // TODO: Check prediction benchmarks
            // $this->validatePredictionBenchmarks($prediction_data, $stripe_data);

            // If pass, the application details should be extracted from the proposal using openAI
            $funding_details = $this->applicationService->extractFundingDetails($uploadResult['path']);
            if($funding_details->getStatusCode() !== 200) {
                throw new \Exception('Funding details extraction failed: ' . $funding_details->getData(true)['message']);
            }

            // The funding details extracted will be stored in database
            $funding_details_data = $funding_details->getData(true);
            
            $application = Application::create([
                'proposal_path' => $uploadResult['path'],
                'funding_amount' => $funding_details_data['data']['funding_amount'],
                'funding_stage' => $funding_details_data['data']['funding_stage'],
                'funding_purpose' => $funding_details_data['data']['funding_purpose'],
                'status' => 'Await Review',
                'startup_id' => auth()->user()->startups()->first()->id,
            ]);

            // Insert the application details into neo4j aura
            $neo4j_response = $this->neo4jService->insertApplicationToNeo4j($application->id);
            if($neo4j_response->getStatusCode() !== 200) {
                throw new \Exception('Failed to insert application to Neo4j: ' . $neo4j_response->getData(true)['error']);
            }
            $neo4j_data = $neo4j_response->getData(true);

            // // The application will go through startup-investor matching  
            $matching_response = $this->neo4jService->matchStartupToInvestor($application->id);
            if($matching_response->getStatusCode() !== 200) {
                throw new \Exception('Failed to match startup to investor: ' . $matching_response->getData(true)['message']);
            }
            $matching_data = $matching_response->getData(true);
            
            // If fail/prediction is less than the threshold, show the error message to the startup (use case ends)            
            
            DB::commit();

            // Return only the necessary data to avoid UTF-8 issues
            return response()->json([
                'message' => 'Application submitted successfully',
                'prediction' => $prediction_data,
                'stripe_data' => $stripe_data,
                'funding_details' => $funding_details_data,
                'neo4j_response' => $neo4j_data,
                'matching_response' => $matching_data,
                'application_id' => $application->id
            ], 201);

        } catch(\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to submit application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function selectInvestor(int $application_id, Request $request): JsonResponse
    {
        try {
            $application = Application::find($application_id);
            $application->investor_id = $request->investor_id;
            $application->save();

            // TODO: Send email to investor

            return response()->json([
                'message' => 'Investor selected successfully',
                'data' => $application,
                'application_id' => $application_id
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to select investor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getApplicationsForStartup(): JsonResponse
    {
        try {
            $applications = Application::where('startup_id', auth()->user()->startups()->first()->id)
                            ->with('investor')
                            ->get();

            $data = $applications->map(function ($application) {
                $proposalUrl = null;
                if ($application->proposal_path) {
                    try {
                        $proposalUrl = $this->fileUploadService->getSignedUrl('business-proposal', $application->proposal_path);
                    } catch (\Exception $e) {
                        $proposalUrl = null;
                    }
                }

                return [
                    'id' => $application->id,
                    'investor_name' => $application->investor ? $application->investor->name : null,
                    'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
                    'status' => $application->status,
                    'proposal_url' => $proposalUrl,
                ];
            });

            return response()->json([
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getApplicationsForInvestor(): JsonResponse
    {
        try {
            $applications = Application::where('investor_id', auth()->user()->investors()->first()->id)
                            ->with('startup')
                            ->get();

            $data = $applications->map(function ($application) {
                $proposalUrl = null;
                if ($application->proposal_path) {
                    try {
                        $proposalUrl = $this->fileUploadService->getSignedUrl('business-proposal', $application->proposal_path);
                    } catch (\Exception $e) {
                        $proposalUrl = null;
                    }
                }

                return [
                    'id' => $application->id,
                    'startup_name' => $application->startup ? $application->startup->name : null,
                    'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
                    'status' => $application->status,
                    'proposal_url' => $proposalUrl,
                ];
            });

            return response()->json([
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getInvestorAwaitReviewApplications(): JsonResponse
    {
        try{
            $applications = Application::where('investor_id', auth()->user()->investors()->first()->id)
                            ->where('status', 'Await Review')
                            ->get();

            return response()->json([
                'data' => $applications
            ], 200);
        }catch(\Exception $e){
            return response()->json([
                'message' => 'Failed to get applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllApplications(): JsonResponse
    {
        try {
            $applications = Application::all();
            $data = $applications->map(function ($application) {
                $proposalUrl = null;
                if ($application->proposal_path) {
                    try {
                        $proposalUrl = $this->fileUploadService->getSignedUrl('business-proposal', $application->proposal_path);
                    } catch (\Exception $e) {
                        $proposalUrl = null;
                    }
                }

                return [
                    'id' => $application->id,
                    'startup_name' => $application->startup ? $application->startup->name : null,
                    'investor_name' => $application->investor ? $application->investor->name : null,
                    'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
                    'status' => $application->status,
                    'proposal_url' => $proposalUrl,
                ];
            });

            return response()->json([
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get all applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPendingApplications(): JsonResponse
    {
        try {
            $applications = Application::where('status', 'Pending')->get();
            $data = $applications->map(function ($application) {
                return [
                    'id' => $application->id,
                ];
            });

            return response()->json([
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get pending applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getApplication($id): JsonResponse
    {
        try {
            $application = Application::find($id);
            $application->startup_agreement_path = $application->agreement ? $application->agreement->startup_agreement_path : null;
            $application->investor_agreement_path = $application->agreement ? $application->agreement->investor_agreement_path : null;
            $application->admin_message = $application->agreement && $application->agreement->message ? $application->agreement->message : null;

            // Generate signed URLs for viewing documents
            if ($application->proposal_path) {
                try {
                    $application->proposal_url = $this->fileUploadService->getSignedUrl('business-proposal', $application->proposal_path);
                } catch (\Exception $e) {
                    $application->proposal_url = null;
                }
            }

            if ($application->startup_agreement_path) {
                try {
                    $application->startup_agreement_url = $this->fileUploadService->getSignedUrl('agreement', $application->startup_agreement_path);
                } catch (\Exception $e) {
                    $application->startup_agreement_url = null;
                }
            }

            if ($application->investor_agreement_path) {
                try {
                    $application->investor_agreement_url = $this->fileUploadService->getSignedUrl('agreement', $application->investor_agreement_path);
                } catch (\Exception $e) {
                    $application->investor_agreement_url = null;
                }
            }

            $startup = $application->startup;
            $startup->email = $startup->user->email;

            $investor = $application->investor;
            $investor->email = $investor->user->email;

            return response()->json([
                'data' => [
                    'startup' => $startup,
                    'investor' => $investor,
                    'application' => $application
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function acceptApplication(int $id, Request $request): JsonResponse
    {
        try {
            $application = Application::find($id);
            $application->status = 'In Progress';
            $application->message = $request->message;
            $application->save();

            return response()->json([
                'message' => 'Application accepted successfully',
                'data' => $application
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to accept application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function rejectApplication(int $id, Request $request): JsonResponse
    {
        try {
            $application = Application::find($id);
            $application->status = 'Rejected';
            $application->message = $request->message;
            $application->save();

            return response()->json([
                'message' => 'Application rejected successfully',
                'data' => $application
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reject application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadAgreement(Request $request, AgreementService $service, int $application_id): JsonResponse
    {
        try {
            $fullPath = $service->handleAgreementUpload($request, auth()->user(), $application_id, $this->fileUploadService);
            
            return response()->json([
                'message' => 'Agreement uploaded successfully',
                'data' => $fullPath
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload agreement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function adminApproveApplication(int $id, Request $request, AgreementService $service): JsonResponse
    {
        try {
            $agreement = $service->approveAgreement($request, auth()->user(), $id);

            return response()->json([
                'message' => 'Application approved successfully',
                'data' => $agreement
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function adminDeclineApplication(int $id, Request $request, AgreementService $service): JsonResponse
    {
        try {
            $agreement = $service->declineAgreement($request, auth()->user(), $id);            

            return response()->json([
                'message' => 'Application declined successfully',
                'data' => $agreement
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to decline application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function validatePredictionBenchmarks($prediction_data, $stripe_data): void
    {
        // Calculate predicted growth rate
        $predicted_revenue = $prediction_data['predicted_revenue'] ?? 0;
        $current_revenue = $stripe_data['revenue_q2'];
        $predicted_growth_rate = $current_revenue > 0 ? ($predicted_revenue - $current_revenue) / $current_revenue : 0;
        
        // Calculate revenue stability (coefficient of variation)
        $revenue_q1 = $stripe_data['revenue_q1'];
        $revenue_q2 = $stripe_data['revenue_q2'];
        $mean_revenue = ($revenue_q1 + $revenue_q2) / 2;
        $revenue_variance = $mean_revenue > 0 ? abs($revenue_q2 - $revenue_q1) / $mean_revenue : 1;
        
        // Benchmark 1: Minimum growth threshold (15%)
        $min_growth_threshold = 0.15;
        if ($predicted_growth_rate < $min_growth_threshold) {
            throw new \Exception('Insufficient growth projection: ' . round($predicted_growth_rate * 100, 1) . '% (minimum: ' . ($min_growth_threshold * 100) . '%)');
        }
        
        // Benchmark 2: Revenue stability (max 40% variance)
        $max_variance_threshold = 0.4;
        if ($revenue_variance > $max_variance_threshold) {
            throw new \Exception('Revenue too volatile: ' . round($revenue_variance * 100, 1) . '% variance (maximum: ' . ($max_variance_threshold * 100) . '%)');
        }
        
        // Benchmark 3: Risk-adjusted growth (growth rate / (1 + variance))
        $risk_adjusted_growth = $predicted_growth_rate / (1 + $revenue_variance);
        $min_risk_adjusted_growth = 0.08; // 8% minimum
        if ($risk_adjusted_growth < $min_risk_adjusted_growth) {
            throw new \Exception('Insufficient risk-adjusted growth: ' . round($risk_adjusted_growth * 100, 1) . '% (minimum: ' . ($min_risk_adjusted_growth * 100) . '%)');
        }
        
        // Benchmark 4: Confidence score (if available from XGBoost)
        if (isset($prediction_data['confidence_score'])) {
            $min_confidence = 0.6; // 60% minimum confidence
            if ($prediction_data['confidence_score'] < $min_confidence) {
                throw new \Exception('Low prediction confidence: ' . round($prediction_data['confidence_score'] * 100, 1) . '% (minimum: ' . ($min_confidence * 100) . '%)');
            }
        }
    }
}
