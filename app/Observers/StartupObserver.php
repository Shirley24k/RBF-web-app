<?php

namespace App\Observers;

use App\Models\Startup;
use App\Services\Neo4jService;
use Illuminate\Support\Facades\Log;

class StartupObserver
{
    public function created(Startup $startup)
    {
        try{
            app(Neo4jService::class)->insertStartupToNeo4j($startup->id);
            Log::info('Startup tag inserted successfully');
        }catch(\Exception $e){
            Log::info('Failed to insert startup tag to Neo4j');
        }
    }
} 