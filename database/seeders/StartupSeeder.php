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
