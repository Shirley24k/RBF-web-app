<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Application;
use App\Models\Proposal;
use App\Models\Investor;

class ApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get up to three reviewed proposals to diversify across startups
        $proposals = Proposal::where('status', 'REVIEWED')->take(3)->get();

        if ($proposals->isEmpty()) {
            $this->command->info('No reviewed proposals found. Please run StartupSeeder and ProposalSeeder first.');
            return;
        }

        // Ensure investors exist for assignment
        $investorIds = Investor::pluck('id')->take(4);
        if ($investorIds->isEmpty()) {
            $this->command->info('No investors found. Please run InvestorSeeder first.');
            return;
        }

        // Randomized counts per status (adjust ranges as needed)
        $counts = [
            'Await Review' => 5,
            'In Progress' => 3,
            'Pending' => 2,
            'Active' => 4,
            'Rejected' => 2,
            'Failed' => 1,
            'Completed' => 6,
        ];

        // Helper to pick a random investor id
        $pickInvestor = function () use ($investorIds) {
            return $investorIds->random();
        };

        $pickProposal = function () use ($proposals) {
            return $proposals->random();
        };

        // Seed Await Review
        for ($i = 0; $i < $counts['Await Review']; $i++) {
            $p = $pickProposal();
            Application::create([
                'proposal_id' => $p->id,
                'status' => 'Await Review',
                'startup_id' => $p->startup_id,
                'investor_id' => $pickInvestor(),
            ]);
        }

        // Seed In Progress
        for ($i = 0; $i < $counts['In Progress']; $i++) {
            $p = $pickProposal();
            Application::create([
                'proposal_id' => $p->id,
                'status' => 'In Progress',
                'message' => 'Thank you for your application. We will approach you shortly.',
                'startup_id' => $p->startup_id,
                'investor_id' => $pickInvestor(),
            ]);
        }

        // Seed Pending
        for ($i = 0; $i < $counts['Pending']; $i++) {
            $p = $pickProposal();
            Application::create([
                'proposal_id' => $p->id,
                'status' => 'Pending',
                'message' => 'Thank you for your application. We will approach you shortly.',
                'startup_id' => $p->startup_id,
                'investor_id' => $pickInvestor(),
            ]);
        }

        // Seed Active (repayments ongoing)
        for ($i = 0; $i < $counts['Active']; $i++) {
            Application::create([
                'proposal_id' => 2,
                'revenue_share_percentage' => 10.00, 
                'repayment_cap' => 150000.00,
                'cap_multiple' => 1.50,
                'status' => 'Active',
                'startup_id' => 1,
                'investor_id' => 1,
                'total_repaid' => 5000.00,
                'repayment_date' => 28
            ]);
        }

        // Seed Rejected
        for ($i = 0; $i < $counts['Rejected']; $i++) {
            $p = $pickProposal();
            Application::create([
                'proposal_id' => $p->id,
                'status' => 'Rejected',
                'message' => 'Does not fit our current investment thesis.',
                'startup_id' => $p->startup_id,
                'investor_id' => $pickInvestor(),
            ]);
        }

        // Seed Failed (risk assessment failed)
        for ($i = 0; $i < $counts['Failed']; $i++) {
            $p = $pickProposal();
            Application::create([
                'proposal_id' => $p->id,
                'status' => 'Failed',
                'message' => 'Requested funding exceeds MRR-based limit.',
                'startup_id' => $p->startup_id,
            ]);
        }

        // Seed Completed (fully repaid)
        for ($i = 0; $i < $counts['Completed']; $i++) {
            $p = $pickProposal();
            $repaymentCap = $p->funding_amount * 1.50;
            Application::create([
                'proposal_id' => $p->id,
                'revenue_share_percentage' => 10.00,
                'repayment_cap' => $repaymentCap,
                'cap_multiple' => 1.50,
                'status' => 'Completed',
                'startup_id' => $p->startup_id,
                'investor_id' => $pickInvestor(),
                'total_repaid' => $repaymentCap,
                'repayment_date' => 28
            ]);
        }

        $this->command->info('Applications seeded successfully!');
    }
}
