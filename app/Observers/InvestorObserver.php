<?php

namespace App\Observers;

use App\Models\Investor;
use App\Services\Neo4jService;
use Illuminate\Support\Facades\Log;
class InvestorObserver
{
    public function created(Investor $investor)
    {
        try{
            app(Neo4jService::class)->insertInvestorTagToNeo4j($investor->id);
            Log::info('Investor tag inserted successfully');
        }catch(\Exception $e){
            Log::info('Failed to insert investor tag to Neo4j');
        }
    }

    public function updated(Investor $investor)
    {
        try{
            app(Neo4jService::class)->updateInvestorTagToNeo4j($investor->id);
            Log::info('Investor tag updated successfully');
        }catch(\Exception $e){
            Log::info('Failed to update investor tag to Neo4j');
        }
    }
} 