<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\ProposalService;
use App\Services\DocumentAnalysisService;
use App\Services\StartupService;

class ProposalController extends Controller
{
    private $proposalService;
    private $documentAnalysisService;
    private $startupService;
    
    public function __construct(
        ProposalService $proposalService,
        DocumentAnalysisService $documentAnalysisService,
        StartupService $startupService
    )
    {
        $this->proposalService = $proposalService;
        $this->documentAnalysisService = $documentAnalysisService;
        $this->startupService = $startupService;
    }

    /**
     * Extract proposal data from uploaded document
     */
    public function extractProposal(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'document' => 'required|file|mimes:pdf|max:10240'
            ]);

            $result = $this->documentAnalysisService->extractProposalData($request->file('document'));
            
            if ($result['success']) {
                return response()->json([
                    'message' => 'Proposal data extracted successfully',
                    'data' => $result['data']
                ], 200);
            } else {
                return response()->json($result, 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to extract proposal data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all proposals for the current startup
     */
    public function getProposals(): JsonResponse
    {
        try {
            $startup = $this->startupService->getCurrentStartup();
            $proposals = $this->proposalService->getProposalsForStartup($startup->id);

            return response()->json([
                'data' => $proposals
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get proposals',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getReviewedProposals(): JsonResponse
    {
        try {
            $startup = $this->startupService->getCurrentStartup();
            $proposals = $this->proposalService->getReviewedProposalsForStartup($startup->id);

            return response()->json([
                'data' => $proposals
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get proposals',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new proposal
     */
    public function createProposal(Request $request): JsonResponse
    {
        try {
            $request->validate([
                // Company Overview
                'title' => 'required|string|max:255',
                'company_name' => 'required|string|max:255',
                'company_industry' => 'required|string|max:100',
                'contact_person' => 'required|string|max:255',
                'contact_email' => 'required|email|max:255',
                'contact_phone' => 'required|string|max:20',
                'business_model' => 'required|string',
                'target_market' => 'required|string',
                'unique_value_proposition' => 'required|string',
                'competitive_advantage' => 'required|string',
                'business_goals' => 'required|string',
                'market_size' => 'required|string|max:255',
                'market_growth_rate' => 'required|string|max:255',
                'market_trends' => 'required|string',
                'competition_analysis' => 'required|string',
                'customer_segments' => 'required|string',
                
                // Funding Requirements
                'funding_amount' => 'required|numeric|min:0',
                'funding_stage' => 'required|string|max:100',
                'funding_purpose' => 'required|string',
                
                // Financial Projections
                'current_revenue' => 'required|numeric|min:0',
                'projected_revenue_12m' => 'required|numeric|min:0',
                'projected_revenue_24m' => 'required|numeric|min:0',
                'current_profit_margin' => 'required|numeric|min:0|max:100',
                'projected_profit_margin' => 'required|numeric|min:0|max:100',
                'break_even_point' => 'required|string|max:255',
                'cash_flow_analysis' => 'required|string'
            ]);

            $startup = $this->startupService->getCurrentStartup();
            $proposal = $this->proposalService->createProposal($request->all(), $startup->id);
            return response()->json([
                'message' => 'Proposal created successfully',
                'data' => $proposal
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create proposal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific proposal by ID
     */
    public function getProposalById($id): JsonResponse
    {
        try {
            $proposal = $this->proposalService->getProposalById((int)$id);

            return response()->json([
                'data' => $proposal
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get proposal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing proposal
     */
    public function updateProposal(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                // Company Overview
                'title' => 'sometimes|string|max:255',
                'company_name' => 'sometimes|string|max:255',
                'company_industry' => 'sometimes|string|max:100',
                'contact_person' => 'sometimes|string|max:255',
                'contact_email' => 'sometimes|email|max:255',
                'contact_phone' => 'sometimes|string|max:20',
                'business_model' => 'sometimes|string',
                'target_market' => 'sometimes|string',
                'unique_value_proposition' => 'sometimes|string',
                'competitive_advantage' => 'sometimes|string',
                'business_goals' => 'sometimes|string',
                'market_size' => 'sometimes|string|max:255',
                'market_growth_rate' => 'sometimes|string|max:255',
                'market_trends' => 'sometimes|string',
                'competition_analysis' => 'sometimes|string',
                'customer_segments' => 'sometimes|string',
                
                // Funding Requirements
                'funding_amount' => 'sometimes|numeric|min:0',
                'funding_stage' => 'sometimes|string|max:100',
                'funding_purpose' => 'sometimes|string',
                
                // Financial Projections
                'current_revenue' => 'sometimes|numeric|min:0',
                'projected_revenue_12m' => 'sometimes|numeric|min:0',
                'projected_revenue_24m' => 'sometimes|numeric|min:0',
                'current_profit_margin' => 'sometimes|numeric|min:0|max:100',
                'projected_profit_margin' => 'sometimes|numeric|min:0|max:100',
                'break_even_point' => 'sometimes|string|max:255',
                'cash_flow_analysis' => 'sometimes|string'
            ]);

            $startup = $this->startupService->getCurrentStartup();
            $proposal = $this->proposalService->updateProposal((int)$id, $request->all(), $startup->id);
            return response()->json([
                'message' => 'Proposal updated successfully',
                'data' => $proposal
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update proposal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update proposal status (REVIEWING or REVIEWED)
     */
    public function reviewProposal(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:REVIEWING,REVIEWED'
            ]);

            $startup = $this->startupService->getCurrentStartup();
            $proposal = $this->proposalService->updateProposalStatus((int)$id, $startup->id, $request->input('status'));

            $message = $request->input('status') === 'REVIEWED' 
                ? 'Proposal review completed successfully' 
                : 'Proposal status updated to reviewing';

            return response()->json([
                'message' => $message,
                'data' => $proposal
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update proposal status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
