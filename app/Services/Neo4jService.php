<?php

namespace App\Services;

use App\Models\Investor;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Startup;
use App\Models\Application;

class Neo4jService
{

    public function insertInvestorTagToNeo4j($investor_id)
    {
        try {
            $investor = Investor::find($investor_id);
            
            $response = Http::post(config('flask.url').'/neo4j/investor', [
                'id' => $investor_id,
                'investment_preferences' => $investor->investment_preferences
            ]);
            
            return $response->json();
            
        } catch(\Exception $e) {
            Log::error('Failed to insert investor tag to Neo4j', [
                'investor_id' => $investor_id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function updateInvestorTagToNeo4j($investor_id)
    {
        try{
            $investor = Investor::find($investor_id);

            $response = Http::post(config('flask.url').'/neo4j/update-investor', [
                'id' => $investor_id,
                'investment_preferences' => $investor->investment_preferences
            ]);

            return $response->json();
        }catch(\Exception $e){
            Log::error('Failed to update investor tag to Neo4j', [
                'investor_id' => $investor_id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function insertStartupToNeo4j($startup_id)
    {
        try{
            $startup = Startup::find($startup_id);
            //Create startup node
            $response = Http::post(config('flask.url').'/neo4j/startup', [
                'id' => $startup_id,
            ]);

            return $response->json();
        }catch(\Exception $e){
            Log::error('Failed to insert startup to Neo4j', [
                'startup_id' => $startup_id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function insertApplicationToNeo4j($application_id): array
    {
        try{
            $application = Application::find($application_id);
            $startup = Startup::find($application->startup_id);
            
            // Convert funding amount to range
            $fundingAmountRange = $this->getFundingAmountRange($application->funding_amount);

            //Create application node
            $response = Http::post(config('flask.url').'/neo4j/application', [
                'application_id' => $application_id,
                'startup_id' => $startup->id,
                'funding_amount_range' => $fundingAmountRange,
                'funding_stage' => $application->funding_stage,
                'company_sector' => $startup->company_sector
            ]);

            if($response->failed()) {
                throw new \Exception('Failed to insert application to Neo4j: ' . ($response->json()['error'] ?? $response->body()));
            }

            return [
                'message' => 'Application inserted successfully',
                'data' => $response->json()
            ];
        }catch(\Exception $e){
            Log::error('Failed to insert application to Neo4j', [
                'application_id' => $application_id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function matchStartupToInvestor($application_id): array
    {
        try{
            $response = Http::post(config('flask.url').'/matching', [
                'application_id' => $application_id
            ]);

            if ($response->failed()) {
                Log::error('Flask matching API failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Failed to match startup to investor');
            }

            return [
                'message' => 'Startup matched to investor successfully',
                'data' => $response->json()
            ];
        }catch(\Exception $e){
            Log::error('Failed to match startup to investor', [
                'application_id' => $application_id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function getFundingAmountRange($amount)
    {
        if ($amount < 100000) {
            return 'Less than RM 100,000';
        } elseif ($amount < 500000) {
            return 'RM 100,000 - RM 500,000';
        } elseif ($amount < 1000000) {
            return 'RM 500,000 - RM 1,000,000';
        } elseif ($amount < 2000000) {
            return 'RM 1,000,000 - RM 2,000,000';
        } elseif ($amount < 5000000) {
            return 'RM 2,000,000 - RM 5,000,000';
        } else {
            return 'More than RM 5,000,000';
        }
    }
}