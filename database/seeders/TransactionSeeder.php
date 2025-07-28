<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Transaction::create([
            'application_id' => 3,
            'amount' => 300000.00,
            'transaction_datetime' => '2024-07-29 10:00:00',
            'from_stripe_id' => 'acct_1Rp47dBas1ZCvKLM',
            'to_stripe_id' => 'acct_1RcP7M4YDZmtY5Om',
            'type' => 'FUND_TRANSFER',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => 3,
            'amount' => 100000.00,
            'transaction_datetime' => '2024-08-28 10:00:00',
            'from_stripe_id' => 'acct_1RcP7M4YDZmtY5Om',
            'to_stripe_id' => 'acct_1Rp47dBas1ZCvKLM',
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => 3,
            'amount' => 100000.00,
            'transaction_datetime' => '2024-09-28 10:00:00',
            'from_stripe_id' => 'acct_1RcP7M4YDZmtY5Om',
            'to_stripe_id' => 'acct_1Rp47dBas1ZCvKLM',
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => 3,
            'amount' => 150000.00,
            'transaction_datetime' => '2024-10-28 10:00:00',
            'from_stripe_id' => 'acct_1RcP7M4YDZmtY5Om',
            'to_stripe_id' => 'acct_1Rp47dBas1ZCvKLM',
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);

        Transaction::create([
            'application_id' => 3,
            'amount' => 100000.00,
            'transaction_datetime' => '2024-11-28 10:00:00',
            'from_stripe_id' => 'acct_1RcP7M4YDZmtY5Om',
            'to_stripe_id' => 'acct_1Rp47dBas1ZCvKLM',
            'type' => 'REPAYMENT',
            'status' => 'Completed',
        ]);
    }
}
