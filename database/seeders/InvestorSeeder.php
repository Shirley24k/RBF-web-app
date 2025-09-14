<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Investor;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class InvestorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $investorData = [
            [
                'email' => 'zalina.azami@gmail.com',
                'password' => Hash::make('zalinaazami'),
                'type' => 'individual',
                'name' => 'Zalina Azami',
                'contact_no' => '+60123456789',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['FinTech', 'HealthTech', 'EdTech', 'CleanTech'],
                    'preferred_funding_stage' => ['series_a', 'series_b'],
                    'investment_amount_range' => 'More than RM 5,000,000',
                    'revenue_share_percentage' => 6
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RpvCQCgc6c7oxXn',
                'user_id' => 3
            ],
            [
                'email' => 'imbvents@gmail.com',
                'password' => Hash::make('imbvents'),
                'type' => 'firm',
                'name' => 'IMB Ventures Sdn Bhd',
                'contact_no' => '+60123459876',
                'country' => 'Malaysia',
                'company_address' => '2, Jalan Imbi, Kuala Lumpur',
                'investment_preferences' => [
                    'preferred_industry' => ['FinTech', 'HealthTech', 'Blockchain', 'AI_ML'],
                    'preferred_funding_stage' => ['series_a'],
                    'investment_amount_range' => 'RM 500,000 - RM 1,000,000',
                    'revenue_share_percentage' => 10
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1S0NtTPhbeMOFZXL',
                'user_id' => 4
            ],
            [
                'email' => 'wong.xiao.meng@gmail.com',
                'password' => Hash::make('wongxiaomeng'),
                'type' => 'individual',
                'name' => 'Wong Xiao Meng',
                'contact_no' => '+60123349789',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['AgriTech', 'SaaS', 'IoT'],
                    'preferred_funding_stage' => ['seed'],
                    'investment_amount_range' => 'Less than RM 100,000',
                    'revenue_share_percentage' => 6
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RyrA7EP2vpa4Dos',
                'user_id' => 5
            ],
            [
                'email' => 'low.kee.heng@gmail.com',
                'password' => Hash::make('lowkeeheng'),
                'type' => 'individual',
                'name' => 'Low Kee Heng',
                'contact_no' => '+60123456789',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['FinTech', 'Cloud_Computing', 'Cybersecurity'],
                    'preferred_funding_stage' => ['seed'],
                    'investment_amount_range' => 'RM 500,000 - RM 1,000,000',
                    'revenue_share_percentage' => 7
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYd',
                'user_id' => 6
            ],
            [
                'email' => 'sarah.ahmad@gmail.com',
                'password' => Hash::make('sarahahmad'),
                'type' => 'individual',
                'name' => 'Sarah Ahmad',
                'contact_no' => '+60123456790',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['E-commerce', 'RetailTech', 'Logistics'],
                    'preferred_funding_stage' => ['seed', 'series_a'],
                    'investment_amount_range' => 'RM 100,000 - RM 500,000',
                    'revenue_share_percentage' => 8
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYe',
                'user_id' => 7
            ],
            [
                'email' => 'techventures@outlook.com',
                'password' => Hash::make('techventures'),
                'type' => 'firm',
                'name' => 'Tech Ventures Capital',
                'contact_no' => '+60123456791',
                'country' => 'Malaysia',
                'company_address' => '15, Jalan Ampang, Kuala Lumpur',
                'investment_preferences' => [
                    'preferred_industry' => ['AI_ML', 'Blockchain', 'IoT', 'Robotics'],
                    'preferred_funding_stage' => ['series_a', 'series_b', 'series_c'],
                    'investment_amount_range' => 'More than RM 5,000,000',
                    'revenue_share_percentage' => 12
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYf',
                'user_id' => 8
            ],
            [
                'email' => 'michael.tan@gmail.com',
                'password' => Hash::make('michaeltan'),
                'type' => 'individual',
                'name' => 'Michael Tan',
                'contact_no' => '+60123456792',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['HealthTech', 'MedTech', 'Biotech'],
                    'preferred_funding_stage' => ['seed', 'series_a'],
                    'investment_amount_range' => 'RM 1,000,000 - RM 2,000,000',
                    'revenue_share_percentage' => 9
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYg',
                'user_id' => 9
            ],
            [
                'email' => 'greenfund@greenventures.com',
                'password' => Hash::make('greenfund'),
                'type' => 'firm',
                'name' => 'Green Ventures Fund',
                'contact_no' => '+60123456793',
                'country' => 'Malaysia',
                'company_address' => '88, Jalan Green, Petaling Jaya',
                'investment_preferences' => [
                    'preferred_industry' => ['CleanTech', 'Renewable_Energy', 'Sustainability', 'AgriTech'],
                    'preferred_funding_stage' => ['seed', 'series_a', 'series_b'],
                    'investment_amount_range' => 'RM 2,000,000 - RM 5,000,000',
                    'revenue_share_percentage' => 11
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYh',
                'user_id' => 10
            ],
            [
                'email' => 'lisa.ong@gmail.com',
                'password' => Hash::make('lisaong'),
                'type' => 'individual',
                'name' => 'Lisa Ong',
                'contact_no' => '+60123456794',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['EdTech', 'Gaming', 'Entertainment', 'Media'],
                    'preferred_funding_stage' => ['seed'],
                    'investment_amount_range' => 'Less than RM 100,000',
                    'revenue_share_percentage' => 5
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYi',
                'user_id' => 11
            ],
            [
                'email' => 'startupcapital@venture.com',
                'password' => Hash::make('startupcapital'),
                'type' => 'firm',
                'name' => 'Startup Capital Partners',
                'contact_no' => '+60123456795',
                'country' => 'Malaysia',
                'company_address' => '25, Jalan Venture, Cyberjaya',
                'investment_preferences' => [
                    'preferred_industry' => ['SaaS', 'Cloud_Computing', 'DevTools', 'API_Services'],
                    'preferred_funding_stage' => ['series_a', 'series_b'],
                    'investment_amount_range' => 'RM 1,000,000 - RM 3,000,000',
                    'revenue_share_percentage' => 10
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYj',
                'user_id' => 12
            ],
            [
                'email' => 'ahmad.rahman@gmail.com',
                'password' => Hash::make('ahmadrahman'),
                'type' => 'individual',
                'name' => 'Ahmad Rahman',
                'contact_no' => '+60123456796',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['FinTech', 'InsurTech', 'RegTech'],
                    'preferred_funding_stage' => ['seed', 'series_a'],
                    'investment_amount_range' => 'RM 500,000 - RM 1,500,000',
                    'revenue_share_percentage' => 8
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYk',
                'user_id' => 13
            ],
            [
                'email' => 'foodtech@innovate.com',
                'password' => Hash::make('foodtech'),
                'type' => 'firm',
                'name' => 'FoodTech Innovation Fund',
                'contact_no' => '+60123456797',
                'country' => 'Malaysia',
                'company_address' => '12, Jalan Food, Shah Alam',
                'investment_preferences' => [
                    'preferred_industry' => ['FoodTech', 'AgriTech', 'Supply_Chain', 'Logistics'],
                    'preferred_funding_stage' => ['seed', 'series_a'],
                    'investment_amount_range' => 'RM 300,000 - RM 1,000,000',
                    'revenue_share_percentage' => 9
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYl',
                'user_id' => 14
            ],
            [
                'email' => 'jennifer.lim@gmail.com',
                'password' => Hash::make('jenniferlim'),
                'type' => 'individual',
                'name' => 'Jennifer Lim',
                'contact_no' => '+60123456798',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['Cybersecurity', 'Privacy', 'Data_Analytics'],
                    'preferred_funding_stage' => ['series_a', 'series_b'],
                    'investment_amount_range' => 'RM 2,000,000 - RM 4,000,000',
                    'revenue_share_percentage' => 11
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYm',
                'user_id' => 15
            ],
            [
                'email' => 'socialimpact@impact.com',
                'password' => Hash::make('socialimpact'),
                'type' => 'firm',
                'name' => 'Social Impact Ventures',
                'contact_no' => '+60123456799',
                'country' => 'Malaysia',
                'company_address' => '30, Jalan Impact, Kuala Lumpur',
                'investment_preferences' => [
                    'preferred_industry' => ['EdTech', 'HealthTech', 'CleanTech', 'Social_Enterprise'],
                    'preferred_funding_stage' => ['seed', 'series_a'],
                    'investment_amount_range' => 'RM 200,000 - RM 800,000',
                    'revenue_share_percentage' => 7
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYn',
                'user_id' => 16
            ],
            [
                'email' => 'robert.lee@gmail.com',
                'password' => Hash::make('robertlee'),
                'type' => 'individual',
                'name' => 'Robert Lee',
                'contact_no' => '+60123456800',
                'country' => 'Malaysia',
                'company_address' => null,
                'investment_preferences' => [
                    'preferred_industry' => ['Gaming', 'VR_AR', 'Entertainment', 'Media'],
                    'preferred_funding_stage' => ['seed', 'series_a'],
                    'investment_amount_range' => 'RM 100,000 - RM 500,000',
                    'revenue_share_percentage' => 6
                ],
                'validation_status' => true,
                'stripe_id' => 'acct_1RxfRHDmumaE4MYo',
                'user_id' => 17
            ]

            ];

            foreach ($investorData as $investor) {

                $user = User::create([
                    'email' => $investor['email'],
                    'password' => $investor['password'],
                    'role' => 'investor',
                    'email_verified_at' => now(),
                ]);

                Investor::create([
                    'type' => $investor['type'],
                    'name' => $investor['name'],
                    'contact_no' => $investor['contact_no'],
                    'country' => $investor['country'],
                    'company_address' => $investor['company_address'],
                    'investment_preferences' => $investor['investment_preferences'],
                    'validation_status' => $investor['validation_status'],
                    'stripe_id' => $investor['stripe_id'],
                    'user_id' => $user->id,
                ]);
            }

        $this->command->info('Investors seeded successfully!');
    }
}
