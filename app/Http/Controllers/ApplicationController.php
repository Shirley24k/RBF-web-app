<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\ApplicationStatsService;
use App\Services\ApplicationListingService;
use App\Services\ApplicationService;
use App\Services\NotificationService;
use App\Services\StartupService;
use App\Models\User;
use App\Models\Startup;
use App\Models\Investor;

class ApplicationController extends Controller
{
    private $applicationStatsService;
    private $applicationListingService;
    private $applicationService;
    private $notificationService;
    private $startupService;

    public function __construct(
        ApplicationStatsService $applicationStatsService,
        ApplicationListingService $applicationListingService,
        ApplicationService $applicationService,
        NotificationService $notificationService,
        StartupService $startupService
    ) {
        $this->applicationStatsService = $applicationStatsService;
        $this->applicationListingService = $applicationListingService;
        $this->applicationService = $applicationService;
        $this->notificationService = $notificationService;
        $this->startupService = $startupService;
    }

    public function submitApplication(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'proposal_id' => 'required|integer|exists:proposals,id'
            ]);

            // Create application directly from selected proposal
            $result = $this->applicationService->submitApplication($request->proposal_id);

            if ($result['success']) {
                return response()->json([
                    'message' => 'Application submitted successfully',
                    'data' => $result['data'],
                    'application_id' => $result['data']['id'] ?? null
                ], 201);
            } else {
                return response()->json($result, 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function assessRisk(int $application_id): JsonResponse
    {
        try {
            $result = $this->applicationService->assessRisk($application_id);

            if ($result['success']) {
                return response()->json($result['data'], 200);
            } else {
                return response()->json($result['data'], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to assess risk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function matchInvestors(int $application_id): JsonResponse
    {
        try {
            $result = $this->applicationService->matchInvestors($application_id);

            if ($result['success']) {
                return response()->json($result['data'], 200);
            } else {
                return response()->json($result, 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to match investors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function selectInvestor(int $application_id, Request $request): JsonResponse
    {
        try {
            $application = $this->applicationService->selectInvestor($application_id, $request->investor_id);

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
            $startup = $this->startupService->getCurrentStartup();
            $data = $this->applicationListingService->listForStartup($startup->id);

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

    public function getRecentApplicationsForStartup(): JsonResponse
    {
        try {
            $startup = $this->startupService->getCurrentStartup();
            $data = $this->applicationListingService->listRecentForStartup($startup->id, 3);

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

    public function getTransactionApplicationsForStartup(): JsonResponse
    {
        try {
            $startup = $this->startupService->getCurrentStartup();
            $data = $this->applicationListingService->listTransactionForStartup($startup->id);
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
            $data = $this->applicationListingService->listForInvestor(auth()->user()->investor()->first()->id);

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
        try {
            $data = $this->applicationListingService->listInvestorAwaitReview(auth()->user()->investor()->first()->id);

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

    public function getRecentApplicationsForInvestor(): JsonResponse
    {
        try {
            $data = $this->applicationListingService->listRecentForInvestor(auth()->user()->investor()->first()->id, 3);

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

    public function getTransactionApplicationsForInvestor(): JsonResponse
    {
        try {
            $data = $this->applicationListingService->listTransactionForInvestor(auth()->user()->investor()->first()->id);

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

    public function getAllApplications(): JsonResponse
    {
        try {
            $data = $this->applicationListingService->listAll();

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
            $data = $this->applicationListingService->listPending();

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
            $data = $this->applicationListingService->getApplicationDetails((int)$id);
            return response()->json(['data' => $data], 200);
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
            $application = $this->applicationService->acceptApplication($id, $request->message);

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
            $application = $this->applicationService->rejectApplication($id, $request->message);

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

    public function sendRepaymentReminder(int $application_id): JsonResponse
    {
        try {
            $result = $this->notificationService->sendRepaymentReminder($application_id);

            if ($result['success']) {
                return response()->json($result['data'], 200);
            } else {
                return response()->json($result, 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send repayment reminder',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendInvestorTopupReminder(int $application_id): JsonResponse
    {
        try {
            $result = $this->notificationService->sendInvestorTopupReminder($application_id);

            if ($result['success']) {
                return response()->json($result['data'], 200);
            } else {
                return response()->json($result, 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send investor top-up reminder',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getApplicationStats(): JsonResponse
    {
        try {
            $user = auth()->user();
            if ($user->role == 'startup' || $user->role == 'staff') {
                $startup = $this->startupService->getCurrentStartup();
                $stats = $this->applicationStatsService->getStartupStats($startup->id);
            } elseif ($user->role == 'investor') {
                $investor = $user->investor()->first();
                $stats = $this->applicationStatsService->getInvestorStats($investor->id);
            } else {
                $stats = $this->applicationStatsService->getGlobalStats();
                $monthlyStats = $this->applicationStatsService->getMonthlyStats();
                $stats = array_merge($stats, $monthlyStats);
            }

            return response()->json([
                'message' => 'Application statistics retrieved successfully',
                'stats' => $stats
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get application statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMonthlyChartData(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            
            // Only allow admin users to access chart data
            if ($user->role !== 'admin') {
                return response()->json([
                    'message' => 'Unauthorized access',
                    'error' => 'Only admin users can access chart data'
                ], 403);
            }

            $months = $request->input('months', 12); // Default to 12 months
            $chartData = $this->applicationStatsService->getMonthlyChartData($months);

            return response()->json([
                'message' => 'Monthly chart data retrieved successfully',
                'data' => $chartData
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get monthly chart data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
