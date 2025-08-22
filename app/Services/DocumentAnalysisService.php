<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class DocumentAnalysisService
{
    //Extract funding details from proposal using OpenAI
    public function extractFundingDetails($proposal_path): array
    {
        try {
            $response = Http::post(config('flask.url').'/proposal-analysis', [
                'proposal_path' => $proposal_path
            ]);

            if($response->successful()) {
                $data = $response->json();
                
                // Clean and convert funding_amount to numeric value
                $funding_amount = $data['funding_amount'] ?? 0;
                if (is_string($funding_amount)) {
                    // Remove currency symbols and commas, then convert to float
                    $funding_amount = (float) preg_replace('/[^0-9.]/', '', $funding_amount);
                }
                
                return [
                    'message' => 'Funding details extracted successfully',
                    'funding_amount' => $funding_amount,
                    'funding_stage' => $data['funding_stage'],
                    'funding_purpose' => $data['funding_purpose'],
                ];
            }

            return [
                'message' => 'Failed to extract funding details',
                'error' => 'Flask service returned unsuccessful response'
            ];
        }catch(\Exception $e) {
            return [
                'message' => 'Failed to extract funding details',
                'error' => $e->getMessage()
            ];
        }
    }

    public function extractAgreementDetail($agreement_path): array
    {
        try {
            $response = Http::post(config('flask.url').'/agreement-analysis', [
                'agreement_path' => $agreement_path
            ]);

            if($response->successful()) {
                $data = $response->json();
                
                $revenue_share_percentage = $data['revenue_share_percentage'] ?? 0;
                if (is_string($revenue_share_percentage)) {
                    // convert 10% to 10, then convert to float
                    $revenue_share_percentage = (float) str_replace('%', '', $revenue_share_percentage);
                }
                $repayment_cap = $data['repayment_cap'] ?? 0;
                if (is_string($repayment_cap)) {
                    // Remove currency symbols and commas, then convert to float
                    $repayment_cap = (float) preg_replace('/[^0-9.]/', '', $repayment_cap);
                }
                $cap_multiple = $data['cap_multiple'] ?? 0;
                if (is_string($cap_multiple)) {
                    // Remove x, then convert to float
                    $cap_multiple = (float) str_replace('x', '', $cap_multiple);
                }
                
                return [
                    'message' => 'Agreement details extracted successfully',
                    'revenue_share_percentage' => $revenue_share_percentage,
                    'repayment_cap' => $repayment_cap,
                    'cap_multiple' => $cap_multiple,                    
                ];
            }

            return [
                'message' => 'Failed to extract agreement details',
                'error' => 'Flask service returned unsuccessful response'
            ];
        }catch(\Exception $e) {
            return [
                'message' => 'Failed to extract agreement details',
                'error' => $e->getMessage()
            ];
        }
    }
}