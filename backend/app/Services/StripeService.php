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
use App\Services\RepaymentService;

class StripeService
{

    public function createDummyTransactions($month, $stripe_id)
    {
        Stripe::setApiKey(config('stripe.secret'));

        $charges = [];
    
        for ($i = 1; $i <= 15; $i++) {
            $charge = Charge::create([
                'amount' => rand(100000, 1000000) * 100, 
                'currency' => 'myr',
                'source' => 'tok_visa',
                'description' => 'Dummy sale from startup',
                'metadata' => [
                    'simulated_month' => $month,
                    'transaction_number' => $i
                ]
            ], [
                'stripe_account' => $stripe_id,
            ]);
    
            $charges[] = $charge;
        }

        return [
            'message' => 'Dummy transactions created successfully',
            'charges' => $charges
        ];
    }

    public function getQuarterlyRevenue($stripe_id)
    {
        try {
            Stripe::setApiKey(config('stripe.secret'));

            $charges = Charge::all([
                'limit' => 90,
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
    public function topUpAccount(float $amount): array
    {
        Stripe::setApiKey(config('stripe.secret'));

        $percentageFee = 0.04;
        $fixedFeeMyr = 1.0;
        $grossAmount = ($amount + $fixedFeeMyr) / (1 - $percentageFee);
        $amountInCents = (int) ceil($grossAmount * 100);

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

        return ['checkout_url' => $session->url];
    }

    public function handleStripeWebhook(Request $request): array
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
            return ['success' => false, 'message' => 'Webhook signature verification failed'];
        }

        // Only verify the webhook is valid, business logic handled by TransactionService
        if ($event->type === 'checkout.session.completed') {
            return ['success' => true, 'message' => 'Webhook verified successfully'];
        }

        return ['success' => true, 'message' => 'Webhook handled'];
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
                    'amount' => $application->proposal->funding_amount * 100,
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
            $investor->balance -= $application->proposal->funding_amount;
            $investor->save();
            
            //Insert transaction to database
            Transaction::create([
                'amount' => $application->proposal->funding_amount,
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
                'amount' => $application->proposal->funding_amount,
                'application_id' => $application->id
            ]);

            return $transfer;
        });
    }

    public function processMonthlyRepayment($application_id, $month): array
    {
        $application = Application::with('startup', 'investor')->findOrFail($application_id);
        $startup = $application->startup;
        $investor = $application->investor;
        $repaymentService = new RepaymentService($this);
        $monthlyRepayment = $repaymentService->calculateRepaymentAmount($application);

        // Check if startup has stripe account
        if (!$startup->stripe_id) {
            throw new \Exception('Startup does not have a stripe account');
        }

        // Check if investor has stripe account
        if (!$investor->stripe_id) {
            throw new \Exception('Investor does not have a stripe account');
        }

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
                    'type' => 'monthly repayment',
                    'month' => $month,
                    'target_repayment_amount' => $monthlyRepayment,
                    'gross_amount' => $grossAmount
                ],
                'success_url' => config('app.frontend_url') . '/application-transaction-details/' . $application->id . '?status=success&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.frontend_url') . '/application-transaction-details/' . $application->id . '?status=cancel',
            ]);

            return ['checkout_url' => $session->url];

        } catch (\Exception $e) {
            throw new \Exception('Stripe repayment checkout failed: ' . $e->getMessage());
        }
    }

    
    public function processPendingRepayment(Transaction $transaction): array
    {
        try {
            Stripe::setApiKey(config('stripe.secret'));
            
            // Create the transfer from platform to investor
            $transfer = Transfer::create([
                'amount' => $transaction->amount * 100, // Convert to cents
                'currency' => 'myr',
                'destination' => $transaction->application->investor->stripe_id,
                'description' => 'Monthly repayment to investor',
                'metadata' => [
                    'application_id' => $transaction->application_id,
                    'transaction_id' => $transaction->id,
                    'repayment_type' => 'monthly repayment'
                ]
            ]);
            
            \Log::info("Stripe transfer created successfully", [
                'transfer_id' => $transfer->id,
                'transaction_id' => $transaction->id,
                'amount' => $transaction->amount
            ]);
            
            return [
                'success' => true,
                'transfer_id' => $transfer->id,
                'message' => 'Transfer completed successfully'
            ];
            
        } catch (\Exception $e) {
            \Log::error("Stripe transfer failed", [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
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
} 