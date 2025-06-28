<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Models\Agreement;
use App\Services\AgreementService;

class ApplicationController extends Controller
{
    public function submitApplication(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document' => 'required|file|mimes:pdf|max:10240'
        ]);

        try {
            $file = $request->file('document');
            $filename = time() . '.' . uniqid() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('funding-documents', $filename, 'local');
            $fullPath = Storage::path($filePath);

            // TODO: The system perform risk assessment on the startup revenue record
            // If pass, the application details should be extracted from the proposal using openAI
                // The funding details extracted will be stored in database
                // The application will go through startup-investor matching            
            // If fail, show the error message to the startup (use case ends)            
            
            $application = Application::create([
                'proposal_path' => $fullPath,
                'funding_amount' => 0,
                'status' => 'Await Review',
                'startup_id' => auth()->user()->startups()->first()->id,
            ]);

            return response()->json([
                'message' => 'Application submitted successfully',
                'data' => $application
            ], 201);

        }catch(\Exception $e) {
            // Delete the uploaded file if it exists
            if (isset($filePath) && Storage::exists($filePath)) {
                Storage::delete($filePath);
            }

            return response()->json([
                'message' => 'Failed to submit application',
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
                return [
                    'id' => $application->id,
                    'investor_name' => $application->investor ? $application->investor->name : null,
                    'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
                    'status' => $application->status,
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
                return [
                    'id' => $application->id,
                    'startup_name' => $application->startup ? $application->startup->name : null,
                    'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
                    'status' => $application->status,
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

    public function getAllApplications(): JsonResponse
    {
        try {
            $applications = Application::all();
            $data = $applications->map(function ($application) {
                return [
                    'id' => $application->id,
                    'startup_name' => $application->startup ? $application->startup->name : null,
                    'investor_name' => $application->investor ? $application->investor->name : null,
                    'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
                    'status' => $application->status,
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

    public function getApplication(int $id): JsonResponse
    {
        try {
            $application = Application::find($id);
            $application->startup_agreement_path = $application->agreement ? $application->agreement->startup_agreement_path : null;
            $application->investor_agreement_path = $application->agreement ? $application->agreement->investor_agreement_path : null;
            $application->admin_message = $application->agreement && $application->agreement->message ? $application->agreement->message : null;

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
            $fullPath = $service->handleAgreementUpload($request, auth()->user(), $application_id);
            
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
}
