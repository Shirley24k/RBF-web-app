<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RiskAssessmentService
{
	//Predict next quarter sales using past revenue from Stripe
    public function predictSales($revenue_q1, $revenue_q2, $growth_rate): array
    {
        try {
            $response = Http::post(config('flask.url').'/predict-sales', [
                'revenue_q1' => $revenue_q1,
                'revenue_q2' => $revenue_q2,
                'growth_rate' => $growth_rate
            ]);

            return [
                'message' => 'Sales predicted successfully',
                'data' => $response->json()
            ];
        }catch(\Exception $e) {
            return [
                'message' => 'Failed to predict sales',
                'error' => $e->getMessage()
            ];
        }
    }

	public function evaluateFundingLimit(float $predictedRevenue, float $revenueQ2, float $requestedFundingAmount): array
	{
		$mrr = $revenueQ2 / 3.0;

		$predictedGrowthRate = ($predictedRevenue - $revenueQ2) / $revenueQ2;
		$estimatedFundingAmount = $predictedGrowthRate > 0 ? $mrr * 6.0 : $mrr * 3.0;
		$pass = $requestedFundingAmount <= $estimatedFundingAmount;

		return [
			'pass' => $pass,
			'mrr' => $mrr,
			'estimated_funding_amount' => $estimatedFundingAmount,
			'predicted_growth_rate' => $predictedGrowthRate,
			'predicted_revenue' => $predictedRevenue,
		];
	}
}


