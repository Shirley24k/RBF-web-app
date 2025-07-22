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
                'preferred_industry' => ['FinTech', 'HealthTech', 'EdTech'],
                'preferred_funding_stage' => ['Seed', 'Series A'],
                'investment_amount_range' => 'Less than RM 100,000',
                'revenue_share_percentage' => 6
            ],
            'validation_status' => true,
            'user_id' => 3
        ]);

        Investor::create([
            'type' => 'firm',
            'name' => 'Investor Firm 1',
            'contact_no' => '+60123456789',
            'company_address' => '5, Jalan Firm, Kuala Lumpur',
            'investment_preferences' => [
                'preferred_industry' => ['FinTech', 'HealthTech'],
                'preferred_funding_stage' => ['Series A'],
                'investment_amount_range' => 'RM 500,000 - RM 1,000,000',
                'revenue_share_percentage' => 10
            ],
            'validation_status' => true,
            'user_id' => 4
        ]);

        Investor::create([
            'type' => 'individual',
            'name' => 'Investor 2',
            'contact_no' => '+60123456789',
            'country' => 'Malaysia',
            'investment_preferences' => [
                'preferred_industry' => ['AgriTech'],
                'preferred_funding_stage' => ['Seed'],
                'investment_amount_range' => 'Less than RM 100,000',
                'revenue_share_percentage' => 6
            ],
            'validation_status' => true,
            'user_id' => 5
        ]);

        Investor::create([
            'type' => 'individual',
            'name' => 'Investor 3',
            'contact_no' => '+60123456789',
            'country' => 'Malaysia',
            'investment_preferences' => [
                'preferred_industry' => ['FinTech'],
                'preferred_funding_stage' => ['Seed'],
                'investment_amount_range' => 'RM 500,000 - RM 1,000,000',
                'revenue_share_percentage' => 7
            ],
            'validation_status' => true,
            'user_id' => 6
        ]);

    }
}
