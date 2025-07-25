<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Agreement;
use App\Services\AgreementService;
use Illuminate\Http\JsonResponse;
use App\Services\FileUploadService;

class AgreementController extends Controller
{
    private $fileUploadService;
    private $agreementService;
    public function __construct(FileUploadService $fileUploadService, AgreementService $agreementService)
    {
        $this->fileUploadService = $fileUploadService;
        $this->agreementService = $agreementService;
    }

    public function getAgreement($application_id)
    {
        $agreement = Agreement::where('application_id', $application_id)->first();
        if ($agreement){
            return response()->json([
                'message' => 'Agreement found',
                'data' => $agreement
            ], 200);
        }
        return response()->json([
            'message' => 'Agreement not found',
            'data' => null
        ], 404);
    }

    public function uploadAgreement(Request $request, int $application_id): JsonResponse
    {
        try {
            $fullPath = $this->agreementService->handleAgreementUpload($request, auth()->user(), $application_id, $this->fileUploadService);
            
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
