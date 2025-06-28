<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Application;
use App\Models\Agreement;
use Illuminate\Support\Facades\DB;

class AgreementService
{
    /**
     * Handle the upload and association of an agreement document.
     *
     * @param Request $request
     * @param \App\Models\User $user
     * @param int $application_id
     * @return string The full path or URL to the uploaded agreement
     * @throws \Exception
     */
    public function handleAgreementUpload(Request $request, $user, $application_id)
    {
        // Validate input
        // $validated = $request->validate([
        //     'document' => 'required|file|mimes:pdf|max:10240'
        // ]);

        // Start transaction for safety
        return DB::transaction(function () use ($request, $user, $application_id) {
            $application = Application::findOrFail($application_id);

            // Handle file upload
            // $file = $request->file('document');
            // $filename = time() . '.' . uniqid() . '.' . $file->getClientOriginalExtension();
            // $filePath = $file->storeAs('agreements', $filename, 'public');
            // $fullPath = Storage::url($filePath);
            $fullPath = "http://reupload.com";

            // Find or create agreement
            $agreement = $application->agreement;
            if (!$agreement) {
                if ($user->role == 'startup') {
                    $agreement = Agreement::create([
                        'application_id' => $application->id,
                        'startup_agreement_path' => $fullPath,
                    ]);
                } else {
                    $agreement = Agreement::create([
                        'application_id' => $application->id,
                        'investor_agreement_path' => $fullPath,
                    ]);
                }
            } else {
                // Check if both agreements are already uploaded and status is 'Pending'
                if ($agreement->startup_agreement_path && $agreement->investor_agreement_path && $application->status == 'Pending') {
                    throw new \Exception('Both agreements are already uploaded and pending admin review. Re-upload is not allowed.');
                }
                
                // Check if both agreements are uploaded and status is 'Active' (admin approved)
                if ($agreement->startup_agreement_path && $agreement->investor_agreement_path && $application->status == 'Active') {
                    throw new \Exception('Application is already active. Re-upload is not allowed.');
                }

                // Allow re-upload only if:
                // 1. Application status is 'In Progress' (admin declined and sent back for revision)
                // 2. Or if one of the agreements is missing
                // 3. Or if re-upload flags are set
                if ($application->status == 'In Progress' || 
                    !$agreement->startup_agreement_path || 
                    !$agreement->investor_agreement_path ||
                    $agreement->needs_startup_reupload ||
                    $agreement->needs_investor_reupload) {
                    
                    if ($user->role == 'startup') {
                        $agreement->update([
                            'startup_agreement_path' => $fullPath,
                            'needs_startup_reupload' => false, // Clear the re-upload flag
                        ]);
                    } else {
                        $agreement->update([
                            'investor_agreement_path' => $fullPath,
                            'needs_investor_reupload' => false, // Clear the re-upload flag
                        ]);
                    }
                    
                    // Check if both agreements are now present and no re-upload flags are set
                    if ($agreement->startup_agreement_path && 
                        $agreement->investor_agreement_path && 
                        !$agreement->needs_startup_reupload && 
                        !$agreement->needs_investor_reupload) {
                        
                        // Change status to 'Pending' for admin review
                        $application->status = 'Pending';
                        $application->save();
                    }
                } else {
                    throw new \Exception('Re-upload is not allowed at this stage.');
                }
            }

            return $fullPath;
        });
    }

    public function approveAgreement(Request $request, $user, $application_id)
    {
        $validate = $request->validate([
            'message' => 'required|string'
        ]);

        return DB::transaction(function () use ($request, $user, $application_id){
            $application = Application::findOrFail($application_id);
            if ($application->status == 'Pending') {
                $agreement = $application->agreement;
                $agreement->message = $request->message;
                $agreement->save();
                $application->status = 'Active';
                $application->save();
            }

            return $agreement;
        });
        
    }
    public function declineAgreement(Request $request, $user, $application_id)
    {
        $validate = $request->validate([
            'message' => 'required|string'
        ]);

        return DB::transaction(function () use ($request, $user, $application_id){
            $application = Application::findOrFail($application_id);
            if ($application->status == 'Pending') {
                $agreement = $application->agreement;
                $agreement->message = $request->message;
                
                // If admin is declining (status will be changed to 'In Progress'), 
                // set re-upload flags for both parties
                if ($agreement->startup_agreement_path && $agreement->investor_agreement_path) {
                    $agreement->needs_startup_reupload = true;
                    $agreement->needs_investor_reupload = true;
                }
                
                $agreement->save();
                $application->status = 'In Progress';
                $application->save();
            }

            return $agreement;
        });
    }
}
