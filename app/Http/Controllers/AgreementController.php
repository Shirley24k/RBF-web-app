<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AgreementService;
use Illuminate\Http\JsonResponse;

class AgreementController extends Controller
{
    private $agreementService;
    public function __construct(AgreementService $agreementService)
    {
        $this->agreementService = $agreementService;
    }

    public function getAgreement(int $application_id): JsonResponse
    {
        try {
            $agreement = $this->agreementService->getAgreementByApplicationId($application_id);
            if ($agreement) {
                return response()->json([
                    'message' => 'Agreement found',
                    'data' => $agreement
                ], 200);
            }
            return response()->json([
                'message' => 'Agreement not found',
                'data' => null
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get agreement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadAgreement(Request $request, int $application_id): JsonResponse
    {
        try {
            $request->validate([
                'document' => 'required|file|mimes:pdf|max:10240'
            ]);
            $fullPath = $this->agreementService->handleAgreementUpload($request->file('document'), auth()->user(), $application_id);
            
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

    public function adminApproveApplication(int $id, Request $request): JsonResponse
    {
        try {
            $agreement = $this->agreementService->approveAgreement($request, auth()->user(), $id);         

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

    public function adminDeclineApplication(int $id, Request $request): JsonResponse
    {
        try {
            $agreement = $this->agreementService->declineAgreement($request, auth()->user(), $id);            

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
}
