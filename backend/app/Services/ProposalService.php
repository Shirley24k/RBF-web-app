<?php

namespace App\Services;

use App\Models\Proposal;
use App\Models\Startup;
use Illuminate\Support\Facades\DB;
use Exception;

class ProposalService
{
    /**
     * Get all proposals for a startup
     */
    public function getProposalsForStartup(int $startupId): array
    {
        $proposals = Proposal::where('startup_id', $startupId)
            ->orderBy('updated_at', 'desc')
            ->get();

        return $proposals->toArray();
    }

    public function getReviewedProposalsForStartup(int $startupId): array
    {
        $proposals = Proposal::where('startup_id', $startupId)
            ->where('status', 'REVIEWED')
            ->orderBy('updated_at', 'desc')
            ->get();

        return $proposals->toArray();
    }

    /**
     * Get a specific proposal by ID
     */
    public function getProposalById(int $proposalId): Proposal
    {
        $proposal = Proposal::where('id', $proposalId)->first();

        if (!$proposal) {
            throw new Exception('Proposal not found');
        }

        return $proposal;
    }

    /**
     * Create a new proposal
     */
    public function createProposal(array $data, int $startupId): Proposal
    {
        return DB::transaction(function () use ($data, $startupId) {
            $proposal = Proposal::create([
                'startup_id' => $startupId,

                // Company Overview
                'title' => $data['title'],
                'company_name' => $data['company_name'],
                'company_industry' => $data['company_industry'],
                'contact_person' => $data['contact_person'],
                'contact_email' => $data['contact_email'],
                'contact_phone' => $data['contact_phone'],
                'business_model' => $data['business_model'],
                'target_market' => $data['target_market'],
                'unique_value_proposition' => $data['unique_value_proposition'],
                'competitive_advantage' => $data['competitive_advantage'],
                'business_goals' => $data['business_goals'],
                'market_size' => $data['market_size'],
                'market_growth_rate' => $data['market_growth_rate'],
                'market_trends' => $data['market_trends'],
                'competition_analysis' => $data['competition_analysis'],
                'customer_segments' => $data['customer_segments'],

                // Funding Requirements
                'funding_amount' => $data['funding_amount'],
                'funding_stage' => $data['funding_stage'],
                'funding_purpose' => $data['funding_purpose'],

                // Financial Projections
                'current_revenue' => $data['current_revenue'] ?? 0,
                'projected_revenue_12m' => $data['projected_revenue_12m'] ?? 0,
                'projected_revenue_24m' => $data['projected_revenue_24m'] ?? 0,
                'current_profit_margin' => $data['current_profit_margin'] ?? 0,
                'projected_profit_margin' => $data['projected_profit_margin'] ?? 0,
                'break_even_point' => $data['break_even_point'] ?? '',
                'cash_flow_analysis' => $data['cash_flow_analysis'] ?? '',

                // System fields
                'status' => 'DRAFT'
            ]);
            return $proposal;
        });
    }

    /**
     * Update an existing proposal
     */
    public function updateProposal(int $proposalId, array $data, int $startupId): Proposal
    {
        $proposal = $this->getProposalById($proposalId, $startupId);

        $proposal->update($data);

        return $proposal->fresh();
    }

    /**
     * Get a specific proposal by ID for a startup
     */
    public function getProposalByIdForStartup(int $proposalId, int $startupId): Proposal
    {
        $proposal = Proposal::where('id', $proposalId)
            ->where('startup_id', $startupId)
            ->first();

        if (!$proposal) {
            throw new Exception('Proposal not found');
        }

        return $proposal;
    }

    /**
     * Update proposal status
     */
    public function updateProposalStatus(int $proposalId, int $startupId, string $status): Proposal
    {
        $proposal = $this->getProposalByIdForStartup($proposalId, $startupId);
        $proposal->update(['status' => $status]);
        return $proposal->fresh();
    }

    /**
     * Review a proposal - update status to 'reviewed' (legacy method)
     */
    public function reviewProposal(int $proposalId, int $startupId): Proposal
    {
        return $this->updateProposalStatus($proposalId, $startupId, 'REVIEWED');
    }
}
