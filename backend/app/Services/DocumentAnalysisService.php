<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class DocumentAnalysisService
{
    //Extract comprehensive proposal details from proposal using OpenAI
    public function extractProposalData($document): array
    {
        try {
            // Send file directly to Flask service
            $response = Http::attach(
                'document', 
                file_get_contents($document->getRealPath()), 
                $document->getClientOriginalName()
            )->post(config('flask.url').'/proposal-analysis');

            if($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'message' => 'Proposal data extracted successfully',
                    'data' => $data
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to extract proposal data',
                'error' => 'Flask service returned unsuccessful response'
            ];
        } catch(\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to extract proposal data',
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