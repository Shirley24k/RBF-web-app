<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Startup;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class StartupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $startupData = [
            [
                'email' => 'shirley24k@outlook.my',
                'password' => Hash::make('shirley24k'),
                'name' => ' Dr. Irfan bin Ahmad',
                'contact_no' => '+60198765432',
                'company_name' => 'CashFlow Solutions Sdn. Bhd.',
                'company_sector' => 'FinTech',
                'company_address' => '68, Jalan Sultan Zainal Abidin 3, 70300, Seremban, Negeri Sembilan',
                'stripe_id' => 'acct_1S28iZBMlS1z1CLu',
                'user_id' => 2
            ],
            [
                'email' => 'hello@medinova.my',
                'password' => Hash::make('startup123'),
                'name' => 'Dr. Aisha Rahim',
                'contact_no' => '+60190000001',
                'company_name' => 'MediNova Health Sdn. Bhd.',
                'company_sector' => 'HealthTech',
                'company_address' => '12, Jalan Hospital, 50450 Kuala Lumpur',
                'stripe_id' => 'acct_1S28iZBMlS1z1CLa',
                'user_id' => 18
            ],
            [
                'email' => 'contact@agritechpro.my',
                'password' => Hash::make('startup123'),
                'name' => 'Azman Hakim',
                'contact_no' => '+60190000002',
                'company_name' => 'AgriTech Pro Sdn. Bhd.',
                'company_sector' => 'AgriTech',
                'company_address' => 'Lot 5, Jalan Kebun, 40460 Shah Alam, Selangor',
                'stripe_id' => 'acct_1S28iZBMlS1z1CLb',
                'user_id' => 19
            ],
            [
                'email' => 'team@eduleap.my',
                'password' => Hash::make('startup123'),
                'name' => 'Nurul Izzah',
                'contact_no' => '+60190000003',
                'company_name' => 'EduLeap Learning Sdn. Bhd.',
                'company_sector' => 'EdTech',
                'company_address' => '23, Jalan Ilmu, 43000 Kajang, Selangor',
                'stripe_id' => 'acct_1S28iZBMlS1z1CLc',
                'user_id' => 20
            ],
            [
                'email' => 'info@cleangrid.my',
                'password' => Hash::make('startup123'),
                'name' => 'Tan Wei Jie',
                'contact_no' => '+60190000004',
                'company_name' => 'CleanGrid Energy Sdn. Bhd.',
                'company_sector' => 'CleanTech',
                'company_address' => '88, Jalan Hijau, 47800 Petaling Jaya, Selangor',
                'stripe_id' => 'acct_1S28iZBMlS1z1CLd',
                'user_id' => 21
            ],
            [
                'email' => 'support@cloudforge.io',
                'password' => Hash::make('startup123'),
                'name' => 'Lim Jia Sheng',
                'contact_no' => '+60190000005',
                'company_name' => 'CloudForge Technologies Sdn. Bhd.',
                'company_sector' => 'SaaS',
                'company_address' => '3A, Jalan Teknologi, 47810 Kota Damansara, Selangor',
                'stripe_id' => 'acct_1S28iZBMlS1z1CLe',
                'user_id' => 22
            ]
        ];

        foreach ($startupData as $startup) {
            $user = User::create([
                'email' => $startup['email'],
                'password' => $startup['password'],
                'role' => 'startup',
                'email_verified_at' => now(),
            ]);

            Startup::create([
                'name' => $startup['name'],
                'contact_no' => $startup['contact_no'],
                'company_name' => $startup['company_name'],
                'company_sector' => $startup['company_sector'],
                'company_address' => $startup['company_address'],
                'stripe_id' => $startup['stripe_id'],
                'user_id' => $user->id,
            ]);
        }
        
        $this->command->info('Startups seeded successfully!');
    }
}
