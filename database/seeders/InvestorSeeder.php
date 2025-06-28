<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Investor;

class InvestorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Investor::create([
            'type' => 'individual',
            'name' => 'Investor 1',
            'contact_no' => '+60123456789',
            'country' => 'Malaysia',
            'investment_preferences' => [
                'preferred_industry' => ['FinTech', 'HealthTech'],
                'preferred_funding_stage' => ['Seed', 'Series A'],
                'investment_amount_range' => 'Less than RM500k',
                'revenue_share_percentage' => 6
            ],
            'validation_status' => true,
            'user_id' => 3
        ]);
    }
}
