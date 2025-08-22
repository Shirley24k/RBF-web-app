<?php

namespace App\Jobs;

use App\Services\Neo4jService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncInvestorToNeo4j implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $investorId;

    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(int $investorId)
    {
        $this->investorId = $investorId;
    }

    /**
     * Execute the job.
     */
    public function handle(Neo4jService $neo4jService): void
    {
        $neo4jService->insertInvestorTagToNeo4j($this->investorId);
    }
}


