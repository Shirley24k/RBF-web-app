<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Application;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get the first completed application to use for transactions
        $application = Application::where('status', 'Completed')->first();

        if (!$application) {
            $this->command->info('No completed applications found. Please run ApplicationSeeder first.');
            return;
        }

        Transaction::create([
            'application_id' => $application->id,
            'amount' => 150000.00,
            'transaction_datetime' => '2024-07-29 10:00:00',
            'from_stripe_id' => $application->investor->stripe_id,
            'to_stripe_id' => $application->startup->stripe_id,
            'type' => 'FUND_TRANSFER',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => $application->id,
            'amount' => 10000.00,
            'transaction_datetime' => '2024-08-28 10:00:00',
            'from_stripe_id' => $application->startup->stripe_id,
            'to_stripe_id' => $application->investor->stripe_id,
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => $application->id,
            'amount' => 15000.00,
            'transaction_datetime' => '2024-09-28 10:00:00',
            'from_stripe_id' => $application->startup->stripe_id,
            'to_stripe_id' => $application->investor->stripe_id,
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => $application->id,
            'amount' => 150000.00,
            'transaction_datetime' => '2024-10-28 10:00:00',
            'from_stripe_id' => $application->startup->stripe_id,
            'to_stripe_id' => $application->investor->stripe_id,
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => $application->id,
            'amount' => 50000.00,
            'transaction_datetime' => '2024-11-28 10:00:00',
            'from_stripe_id' => $application->startup->stripe_id,
            'to_stripe_id' => $application->investor->stripe_id,
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);


        $activeApplication = Application::where('status', 'Active')->first();
        if (!$activeApplication) {
            $this->command->info('No active applications found. Please run ApplicationSeeder first.');
            return;
        }
    
        Transaction::create([
            'application_id' => $activeApplication->id,
            'amount' => 150000.00,
            'transaction_datetime' => '2025-06-27 10:00:00',
            'from_stripe_id' => $activeApplication->investor->stripe_id,
            'to_stripe_id' => $activeApplication->startup->stripe_id,
            'type' => 'FUND_TRANSFER',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => $activeApplication->id,
            'amount' => 5000.00,
            'transaction_datetime' => '2025-07-27 10:00:00',
            'from_stripe_id' => $activeApplication->startup->stripe_id,
            'to_stripe_id' => $activeApplication->investor->stripe_id,
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);
    
        $this->command->info('Transactions seeded successfully!');
    }
}
