<?php

namespace App\Observers;

use App\Models\Investor;
use Illuminate\Support\Facades\Log;
use App\Jobs\SyncInvestorToNeo4j;
use App\Jobs\UpdateInvestorInNeo4j;
class InvestorObserver
{
    public function created(Investor $investor)
    {
        try{
            SyncInvestorToNeo4j::dispatch($investor->id);
            Log::info('Dispatch sync investor to Neo4j', ['investor_id' => $investor->id]);
        }catch(\Exception $e){
            Log::error('Failed to dispatch sync investor to Neo4j', ['investor_id' => $investor->id, 'error' => $e->getMessage()]);
        }
    }

    public function updated(Investor $investor)
    {
        try{
            UpdateInvestorInNeo4j::dispatch($investor->id);
            Log::info('Dispatch update investor to Neo4j', ['investor_id' => $investor->id]);
        }catch(\Exception $e){
            Log::error('Failed to dispatch update investor to Neo4j', ['investor_id' => $investor->id, 'error' => $e->getMessage()]);
        }
    }
} 