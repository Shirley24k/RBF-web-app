<?php

namespace App\Observers;

use App\Models\Startup;
use Illuminate\Support\Facades\Log;
use App\Jobs\SyncStartupToNeo4j;

class StartupObserver
{
    public function created(Startup $startup)
    {
        try{
            SyncStartupToNeo4j::dispatch($startup->id);
            Log::info('Dispatch sync startup to Neo4j', ['startup_id' => $startup->id]);
        }catch(\Exception $e){
            Log::error('Failed to dispatch sync startup to Neo4j', ['startup_id' => $startup->id, 'error' => $e->getMessage()]);
        }
    }
} 