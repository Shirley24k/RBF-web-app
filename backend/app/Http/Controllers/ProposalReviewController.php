<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\ProposalReview;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Services\StartupService;

class ProposalReviewController extends Controller
{
    protected $startupService;

    public function __construct(StartupService $startupService)
    {
        $this->startupService = $startupService;
    }

    /**
     * Save startup reviews for a proposal
     */
    public function store(Request $request, string $proposalId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reviews' => 'sometimes|array',
            'reviews.company' => 'nullable|array',
            'reviews.funding' => 'nullable|array',
            'reviews.financial' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $startup = $this->startupService->getCurrentStartup();
            $proposal = Proposal::where('id', $proposalId)
                ->where('startup_id', $startup->id)
                ->firstOrFail();

            // Get startup owner name
            $startupOwnerName = $startup->name ?: 'Startup Owner';

            DB::transaction(function () use ($proposal, $request, $startupOwnerName) {
                $reviews = $request->input('reviews', []);
                
                if (empty($reviews)) {
                    // No reviews submitted; treat as successful no-op
                    return;
                }
                
                foreach (['company', 'funding', 'financial'] as $section) {
                    if (isset($reviews[$section]) && is_array($reviews[$section]) && !empty($reviews[$section])) {
                        $existingReview = ProposalReview::where('proposal_id', $proposal->id)
                            ->where('section_type', $section)
                            ->first();
                        
                        // Add startup owner name to each review
                        $startupReviews = array_map(function($review) use ($startupOwnerName) {
                            return [
                                'message' => $review['message'],
                                'user_type' => 'startup_owner',
                                'user_name' => $startupOwnerName,
                                'created_at' => $review['created_at']
                            ];
                        }, $reviews[$section]);
                        
                        if ($existingReview) {
                            // Append new comments to existing ones
                            $existingComments = $existingReview->comments ?: [];
                            $allComments = array_merge($existingComments, $startupReviews);
                            
                            $existingReview->update([
                                'comments' => $allComments,
                                'is_resolved' => false // New reviews start as unresolved
                            ]);
                        } else {
                            // Create new review with startup reviews
                            ProposalReview::create([
                                'proposal_id' => $proposal->id,
                                'section_type' => $section,
                                'comments' => $startupReviews,
                                'is_resolved' => false
                            ]);
                        }
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Reviews saved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update review resolution status
     */
    public function updateResolution(Request $request, string $proposalId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'section' => 'required|in:company,funding,financial',
            'is_resolved' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $startup = $this->startupService->getCurrentStartup();
            $proposal = Proposal::where('id', $proposalId)
                ->where('startup_id', $startup->id)
                ->firstOrFail();

            $review = ProposalReview::where('proposal_id', $proposal->id)
                ->where('section_type', $request->input('section'))
                ->firstOrFail();

            $review->update([
                'is_resolved' => $request->input('is_resolved')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review resolution status updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update review resolution',
                'error' => $e->getMessage()
            ], 500);
        }
    }

     /**
     * Get a specific proposal with its reviews for staff review
     */
    public function show(string $proposalId): JsonResponse
    {
        try {
            $proposal = Proposal::where('id', $proposalId)
                ->where('status', 'REVIEWING')
                ->with(['startup', 'reviews'])
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $proposal
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch proposal for review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save staff responses to startup reviews
     */
    public function storeResponseForStaff(Request $request, string $proposalId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'responses' => 'required|array',
            'responses.company' => 'nullable|array',
            'responses.funding' => 'nullable|array',
            'responses.financial' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $proposal = Proposal::where('id', $proposalId)
                ->where('status', 'REVIEWING')
                ->firstOrFail();

            // Get staff name
            $staff = \App\Models\Staff::where('user_id', Auth::id())->first();
            $staffName = $staff ? $staff->name : 'Staff';

            DB::transaction(function () use ($proposal, $request, $staffName) {
                $responses = $request->input('responses');
                
                foreach (['company', 'funding', 'financial'] as $section) {
                    if (isset($responses[$section]) && is_array($responses[$section]) && !empty($responses[$section])) {
                        $existingReview = ProposalReview::where('proposal_id', $proposal->id)
                            ->where('section_type', $section)
                            ->first();
                        
                        // Add staff name to each response
                        $staffResponses = array_map(function($response) use ($staffName) {
                            return [
                                'message' => $response['message'],
                                'user_type' => 'staff',
                                'user_name' => $staffName,
                                'created_at' => $response['created_at']
                            ];
                        }, $responses[$section]);
                        
                        if ($existingReview) {
                            // Append new staff responses to existing comments
                            $existingComments = $existingReview->comments ?: [];
                            $allComments = array_merge($existingComments, $staffResponses);
                            
                            $existingReview->update([
                                'comments' => $allComments
                            ]);
                        } else {
                            // Create new review with staff responses
                            ProposalReview::create([
                                'proposal_id' => $proposal->id,
                                'section_type' => $section,
                                'comments' => $staffResponses
                            ]);
                        }
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Staff responses saved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save staff responses',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
