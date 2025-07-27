<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Stripe\Stripe;
use Stripe\Charge;
use App\Models\Application;
use App\Services\StripeService;

class ApplicationService
{
    //Retrieve quarterly revenue from Stripe
    public function getQuarterlyRevenue($stripe_id): JsonResponse
    {
        try {
            $stripeService = app(StripeService::class);
            $revenueData = $stripeService->getQuarterlyRevenue($stripe_id);

            return response()->json([
                'message' => 'Quarterly revenue retrieved successfully',
                'revenue_q1' => $revenueData['revenue_q1'],
                'revenue_q2' => $revenueData['revenue_q2'],
                'growth_rate' => $revenueData['growth_rate']
            ], 200);

        } catch(\Exception $e) {
            return response()->json([
                'message' => 'Failed to get quarterly revenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    //Predict next quarter sales using past revenue from Stripe
    public function predictSales($revenue_q1, $revenue_q2, $growth_rate): JsonResponse
    {
        try {
            $response = Http::post(config('flask.url').'/predict-sales', [
                'revenue_q1' => $revenue_q1,
                'revenue_q2' => $revenue_q2,
                'growth_rate' => $growth_rate
            ]);

            return response()->json([
                'message' => 'Sales predicted successfully',
                'data' => $response->json()
            ], 200);
        }catch(\Exception $e) {
            return response()->json([
                'message' => 'Failed to predict sales',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //Extract funding details from proposal using OpenAI
    public function extractFundingDetails($proposal_path): JsonResponse
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
                
                return response()->json([
                    'message' => 'Funding details extracted successfully',
                    'data' => [
                        'funding_amount' => $funding_amount,
                        'funding_stage' => $data['funding_stage'],
                        'funding_purpose' => $data['funding_purpose'],
                    ]
                ], 200);
            }

            return response()->json([
                'message' => 'Failed to extract funding details',
                'error' => 'Flask service returned unsuccessful response'
            ], 500);
        }catch(\Exception $e) {
            return response()->json([
                'message' => 'Failed to extract funding details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}