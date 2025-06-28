<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Application;

class ApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // simulate successful application
        Application::create([
            'proposal_path' => 'proposal.pdf',
            'funding_amount' => 100000.00,
            'status' => 'Await Review',
            'startup_id' => 1,
            'investor_id' => 1,
        ]);

        // simulate rejected application
        Application::create([
            'proposal_path' => 'proposal.pdf',
            'funding_amount' => 200000.00,
            'status' => 'Await Review',
            'startup_id' => 1,
            'investor_id' => 1,
        ]);

        // simulate completed application
        Application::create([
            'proposal_path' => 'proposal.pdf',
            'funding_amount' => 300000.00,
            'status' => 'Completed',
            'startup_id' => 1,
            'investor_id' => 1,
        ]);
    }
}
