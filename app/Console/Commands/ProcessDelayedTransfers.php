<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;
use App\Models\Application;
use Stripe\Stripe;
use Stripe\Transfer;

class ProcessDelayedTransfers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transfers:process-delayed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending repayment transfers that are older than 3 minutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Processing delayed transfers...');

        // Get pending repayment transactions older than 3 minutes
        $pendingTransactions = Transaction::where('type', 'REPAYMENT')
            ->where('status', 'Pending')
            ->where('transaction_datetime', '<=', now()->subMinutes(3))
            ->with(['application.startup', 'application.investor'])
            ->get();

        if ($pendingTransactions->isEmpty()) {
            $this->info('No pending transactions found.');
            return;
        }

        $this->info("Found {$pendingTransactions->count()} pending transactions to process.");

        Stripe::setApiKey(config('stripe.secret'));

        foreach ($pendingTransactions as $transaction) {
            $this->info("Processing transaction ID: {$transaction->id} for application: {$transaction->application_id}");

            try {
                // Create the transfer from platform to investor
                $transfer = Transfer::create([
                    'amount' => $transaction->amount * 100, // Convert to cents
                    'currency' => 'myr',
                    'destination' => $transaction->application->investor->stripe_id,
                    'description' => 'Monthly repayment to investor',
                    'metadata' => [
                        'application_id' => $transaction->application_id,
                        'transaction_id' => $transaction->id,
                        'repayment_type' => 'monthly_repayment'
                    ]
                ]);

                // Update transaction status to completed
                $transaction->status = 'Completed';
                $transaction->save();

                // Update application total_repaid
                $application = $transaction->application;
                $application->total_repaid = $this->getTotalRepaid($application->id);
                $application->save();

                // Update application status if completed
                if ($application->total_repaid >= $application->repayment_cap) {
                    $application->status = 'Completed';
                    $application->save();
                }

                $this->info("✅ Transfer completed for transaction ID: {$transaction->id}");

            } catch (\Exception $e) {
                $this->error("❌ Transfer failed for transaction ID: {$transaction->id} - {$e->getMessage()}");
                \Log::error('Delayed transfer failed', [
                    'transaction_id' => $transaction->id,
                    'application_id' => $transaction->application_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info('Delayed transfer processing completed.');
    }

    private function getTotalRepaid($applicationId)
    {
        return Transaction::where('application_id', $applicationId)
            ->where('type', 'REPAYMENT')
            ->where('status', 'Completed')
            ->sum('amount');
    }
}
