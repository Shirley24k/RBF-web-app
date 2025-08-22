<?php

namespace App\Jobs;

use App\Services\Neo4jService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncStartupToNeo4j implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $startupId;

    public int $tries = 3;

    public function __construct(int $startupId)
    {
        $this->startupId = $startupId;
    }

    public function handle(Neo4jService $neo4jService): void
    {
        $neo4jService->insertStartupToNeo4j($this->startupId);
    }
}


