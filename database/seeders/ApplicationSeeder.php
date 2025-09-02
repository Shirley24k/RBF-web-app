<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Application;
use App\Models\Proposal;

class ApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get the first proposal to use for applications
        $proposal = Proposal::where('status', 'REVIEWED')->first();

        if (!$proposal) {
            $this->command->info('No proposals found. Please run ProposalSeeder first.');
            return;
        }

        // simulate successful application
        Application::create([
            'proposal_id' => $proposal->id,
            'revenue_share_percentage' => 10.00,
            'repayment_cap' => $proposal->funding_amount * 1.5,
            'cap_multiple' => 1.50,
            'status' => 'Active',
            'startup_id' => 1,
            'investor_id' => 1,
            'total_repaid' => 5000.00,
            'repayment_date' => 27
        ]);

        // simulate rejected application
        Application::create([
            'proposal_id' => $proposal->id,
            'status' => 'Await Review',
            'startup_id' => 1,
            'investor_id' => 2,
        ]);

        // simulate completed application
        Application::create([
            'proposal_id' => $proposal->id,
            'revenue_share_percentage' => 10.00,
            'repayment_cap' => $proposal->funding_amount * 1.5,
            'cap_multiple' => 1.50,
            'status' => 'Completed',
            'startup_id' => 1,
            'investor_id' => 1,
            'total_repaid' => $proposal->funding_amount * 1.5,
            'repayment_date' => 28
        ]);

        $this->command->info('Applications seeded successfully!');
    }
}
