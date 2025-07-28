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
            'proposal_path' => 'Business proposal sample.pdf',
            'funding_amount' => 100000.00,
            'funding_stage' => 'Seed',
            'funding_purpose' => 'Product Development',
            'status' => 'Await Review',
            'startup_id' => 1,
            'investor_id' => 1,
        ]);

        // simulate rejected application
        Application::create([
            'proposal_path' => 'Business proposal sample.pdf',
            'funding_amount' => 200000.00,
            'funding_stage' => 'Series A',
            'funding_purpose' => 'Business Expansion',
            'status' => 'Await Review',
            'startup_id' => 1,
            'investor_id' => 1,
        ]);

        // simulate completed application
        Application::create([
            'proposal_path' => 'Business proposal sample.pdf',
            'funding_amount' => 300000.00,
            'funding_stage' => 'Series B',
            'funding_purpose' => 'Marketing and Sales',
            'revenue_share_percentage' => 10.00,
            'repayment_cap' => 450000.00,
            'cap_multiple' => 1.50,
            'status' => 'Completed',
            'startup_id' => 1,
            'investor_id' => 1,
            'total_repaid' => 450000.00,
            'repayment_date' => 28
        ]);
    }
}
