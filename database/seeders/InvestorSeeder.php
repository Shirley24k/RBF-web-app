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
