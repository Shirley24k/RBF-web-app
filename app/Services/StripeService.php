<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Stripe\Charge;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Checkout\Session;
use App\Models\Investor;
use App\Models\Application;
use App\Models\Startup;
use Illuminate\Http\Request;
use Stripe\Transfer;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use Stripe\Account;
use Stripe\Webhook;
use Stripe\PaymentMethod;
use Stripe\Balance;
use Stripe\BalanceTransaction;

class StripeService
{

    public function createDummyTransactions($month)
    {
        Stripe::setApiKey(config('stripe.secret'));

        $charges = [];
    
        for ($i = 1; $i <= 10; $i++) {
            $charge = Charge::create([
                'amount' => rand(1000, 10000) * 100, 
                'currency' => 'myr',
                'source' => 'tok_visa',
                'description' => 'Dummy sale from startup A',
                'metadata' => [
                    'simulated_month' => $month,
                    'transaction_number' => $i
                ]
            ], [
                'stripe_account' => 'acct_1RcP7M4YDZmtY5Om',
            ]);
    
            $charges[] = $charge;
        }

        return response()->json([
            'message' => 'Dummy transactions created successfully',
            'charges' => $charges
        ]);
    }

    public function getQuarterlyRevenue($stripe_id)
    {
        try {
            Stripe::setApiKey(config('stripe.secret'));

            $charges = Charge::all([
                'limit' => 60,
            ], [
                'stripe_account' => $stripe_id,
            ]);

            $monthly_revenue = [];

            foreach($charges->data as $charge) {
                if(isset($charge->metadata['simulated_month'])) {
                    $month = $charge->metadata['simulated_month'];
                    $amount = $charge->amount / 100; //convert from sen to rm
                    if(!isset($monthly_revenue[$month])){
                        $monthly_revenue[$month] = 0;
                    }
                    $monthly_revenue[$month] += $amount;
                }
            }

            $revenue_q1 = 0;
            $revenue_q2 = 0;
            foreach($monthly_revenue as $month => $amount){
                if(in_array($month, ['2025-01', '2025-02', '2025-03'])){
                    $revenue_q1 += $amount;
                }elseif(in_array($month, ['2025-04', '2025-05', '2025-06'])){
                    $revenue_q2 += $amount;
                }
            }

            $growth_rate = $revenue_q1 > 0 ? ($revenue_q2 - $revenue_q1) / $revenue_q1 : 0;

            return [
                'revenue_q1' => $revenue_q1,
                'revenue_q2' => $revenue_q2,
                'growth_rate' => $growth_rate,
                'monthly_revenue' => $monthly_revenue
            ];

        } catch(\Exception $e) {
            throw new \Exception('Failed to get quarterly revenue: ' . $e->getMessage());
        }
    }

    public function getMonthlyRevenue($stripe_id, $month)
    {
        Stripe::setApiKey(config('stripe.secret'));
        $charges = Charge::all([
            'limit' => 30,
        ], [
            'stripe_account' => $stripe_id,
        ]);

        $monthly_revenue = 0;
        foreach($charges->data as $charge){
            if($charge->metadata['simulated_month'] == $month){
                $monthly_revenue += $charge->amount / 100;
            }
        }
        return $monthly_revenue;
    }

    // investor top up enough funding amount to platform Stripe account
    public function topUpAccount(float $amount)
    {
        Stripe::setApiKey(config('stripe.secret'));

        $amountInCents = $amount * 100;

        $session = Session::create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => 'myr',
                    'product_data' => [
                        'name' => 'Investor Wallet Top-up',
                    ],
                    'unit_amount' => $amountInCents,
                ],
                'quantity' => 1,
            ]],
            'metadata' => [
                'investor_id' => auth()->user()->id,
                'topup_amount' => $amountInCents,
                'type' => 'fund transfer'
            ],
            'success_url' => config('app.frontend_url') . '/investor-transaction?status=success&session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.frontend_url') . '/investor-transaction?status=cancel',
        ]);

        return response()->json(['checkout_url' => $session->url]);
    }

    public function handleStripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $event = null;

        try {
            $event = Webhook::constructEvent(
                $payload, $sig_header, config('stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            \Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return response('Webhook error', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            
            // Handle investor top-up
            $transactionType = $session->metadata->type ?? null;

            if ($transactionType === 'fund transfer') {
                $amountMyr = $session->metadata->topup_amount / 100; // Convert from cents to MYR
                $investor = Investor::where('user_id', $session->metadata->investor_id)->first();
                if ($investor) {
                    $investor->balance += $amountMyr;
                    $investor->save();
                } else {
                    \Log::warning('Investor not found for webhook', ['investor_id' => $investorId]);
                }
            } else if ($transactionType === 'monthly_repayment') {
                //Handle monthly repayment
                $this->handleMonthlyRepaymentWebhook($session);
            }
            
        }

        return response('Webhook handled', 200);
    }

    public function fundTransfer($application_id)
    {
        return DB::transaction(function () use ($application_id) {
            $application = Application::with('startup', 'investor')->findOrFail($application_id);
            $startup = $application->startup;
            $investor = $application->investor;

            //Check startup has stripe account
            if(!$startup->stripe_id){
                throw new \Exception('Startup does not have a stripe account');
            }
            
            //Check investor has stripe account
            if(!$investor->stripe_id){
                throw new \Exception('Investor does not have a stripe account');
            }

            Stripe::setApiKey(config('stripe.secret'));

            try {
                $transfer = Transfer::create([
                    'amount' => $application->funding_amount * 100,
                    'currency' => 'myr',
                    'destination' => $startup->stripe_id,
                    'description' => 'Fund transfer to startup',
                    'metadata' => [
                        'application_id' => $application->id,
                        'investor_id' => $investor->id,
                    ]
                ]);
                
                \Log::info('Transfer created', [
                    'transfer_id' => $transfer->id ?? 'null',
                    'transfer_object' => $transfer ? 'exists' : 'null',
                    'application_id' => $application->id
                ]);
                
            } catch (\Exception $e) {
                // If Stripe throws an error, return the Stripe error message
                throw new \Exception('Stripe transfer failed: ' . $e->getMessage());
            }

            // If we get here, transfer was successful (Stripe would have thrown an exception if it failed)
            //Deduct investor balance
            $investor->balance -= $application->funding_amount;
            $investor->save();
            
            //Insert transaction to database
            Transaction::create([
                'amount' => $application->funding_amount,
                'type' => 'FUND_TRANSFER',
                'transaction_datetime' => now(),
                'from_stripe_id' => $investor->stripe_id,
                'to_stripe_id' => $startup->stripe_id,
                'status' => 'Completed',
                'application_id' => $application->id,
            ]);

            //Update repayment date to application table
            $firstRepaymentDate = now()->addDays(30);
            $application->repayment_date = $firstRepaymentDate->day; // Store only the day of month (1-31)
            $application->save();
            
            \Log::info('Transfer completed successfully', [
                'transfer_id' => $transfer->id,
                'amount' => $application->funding_amount,
                'application_id' => $application->id
            ]);

            return $transfer;
        });
    }

    public function processMonthlyRepayment($application_id, $month)
    {
        $application = Application::with('startup', 'investor')->findOrFail($application_id);
        $startup = $application->startup;
        $investor = $application->investor;
        $revenue = $this->getMonthlyRevenue($startup->stripe_id, $month);

        // Check if startup has stripe account
        if (!$startup->stripe_id) {
            throw new \Exception('Startup does not have a stripe account');
        }

        // Check if investor has stripe account
        if (!$investor->stripe_id) {
            throw new \Exception('Investor does not have a stripe account');
        }

        // Calculate the monthly repayment amount
        $monthlyRepayment = $revenue * $application->revenue_share_percentage;

        // Check if monthly repayment + total repaid is greater than the repayment cap
        if ($monthlyRepayment + $application->total_repaid > $application->repayment_cap) {
            $monthlyRepayment = $application->repayment_cap - $application->total_repaid;
        }

        // Calculate the amount to charge startup (including processing fee)
        $grossAmount = $this->calculateGrossAmount($monthlyRepayment);

        Stripe::setApiKey(config('stripe.secret'));

        try {
            // Create checkout session for manual payment (like topUpAccount)
            $session = Session::create([
                'payment_method_types' => ['card'],
                'mode' => 'payment',
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'myr',
                        'product_data' => [
                            'name' => 'Monthly Repayment',
                            'description' => "Repayment for application #{$application->id} - {$month}",
                        ],
                        'unit_amount' => $grossAmount * 100, // Use gross amount including fees
                    ],
                    'quantity' => 1,
                ]],
                'metadata' => [
                    'application_id' => $application->id,
                    'startup_id' => $startup->id,
                    'investor_id' => $investor->id,
                    'type' => 'monthly_repayment',
                    'month' => $month,
                    'target_repayment_amount' => $monthlyRepayment,
                    'gross_amount' => $grossAmount
                ],
                'success_url' => config('app.frontend_url') . '/application-transaction-details/' . $application->id . '?status=success&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.frontend_url') . '/application-transaction-details/' . $application->id . '?status=cancel',
            ]);

            return response()->json(['checkout_url' => $session->url]);

        } catch (\Exception $e) {
            throw new \Exception('Stripe repayment checkout failed: ' . $e->getMessage());
        }
    }

    public function getTotalRepaid($application_id)
    {
        return Transaction::where('application_id', $application_id)
            ->where('type', 'REPAYMENT')
            ->where('status', 'Completed')
            ->sum('amount');
    }

    /**
     * Calculate the gross amount needed to achieve a target net amount after Stripe fees
     */
    private function calculateGrossAmount($targetNetAmount)
    {
        $stripeFeePercentage = 0.04; // 4%
        $stripeFeeFixed = 1; // RM 1
        
        // Calculate the gross amount needed to get the desired net amount
        // Formula: gross_amount = (net_amount + fixed_fee) / (1 - percentage_fee)
        $grossAmount = ($targetNetAmount + $stripeFeeFixed) / (1 - $stripeFeePercentage);
        
        // Round up to nearest cent to ensure we have enough
        return ceil($grossAmount * 100) / 100;
    }

    /**
     * Handle monthly repayment webhook when checkout session is completed
     */
    public function handleMonthlyRepaymentWebhook($session)
    {
        try {
            $applicationId = $session->metadata->application_id ?? null;
            $startupId = $session->metadata->startup_id ?? null;
            $investorId = $session->metadata->investor_id ?? null;
            $month = $session->metadata->month ?? null;
            $targetAmount = $session->metadata->target_repayment_amount ?? 0;

            if (!$applicationId || !$startupId || !$investorId) {
                \Log::error('Missing metadata for monthly repayment webhook', [
                    'session_id' => $session->id,
                    'metadata' => $session->metadata
                ]);
                return;
            }

            $application = Application::with(['startup', 'investor'])->find($applicationId);
            if (!$application) {
                \Log::error('Application not found for monthly repayment webhook', ['application_id' => $applicationId]);
                return;
            }

            // Insert transaction record with Pending status
            Transaction::create([
                'amount' => $targetAmount,
                'type' => 'REPAYMENT',
                'transaction_datetime' => now(),
                'from_stripe_id' => $application->startup->stripe_id,
                'to_stripe_id' => $application->investor->stripe_id,
                'status' => 'Pending', // Mark as pending until transfer completes
                'application_id' => $applicationId,
            ]);

            \Log::info('Monthly repayment webhook processed - transaction created with Pending status', [
                'application_id' => $applicationId,
                'amount' => $targetAmount,
                'session_id' => $session->id,
                'note' => 'Run: php artisan transfers:process-delayed to process transfer after 3 minutes'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error processing monthly repayment webhook', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);
        }
    }


} 