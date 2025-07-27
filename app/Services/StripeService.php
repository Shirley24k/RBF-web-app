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
            $investorId = $session->metadata->investor_id ?? null;
            $amount = $session->metadata->topup_amount ?? 0;

            if ($investorId && $amount) {
                $amountMyr = $amount / 100; // Convert from cents to MYR
                $investor = Investor::where('user_id', $investorId)->first();
                if ($investor) {
                    $investor->balance += $amountMyr;
                    $investor->save();
                    
                    \Log::info('Investor balance updated via webhook', [
                        'investor_id' => $investorId,
                        'amount' => $amountMyr,
                        'new_balance' => $investor->balance
                    ]);
                } else {
                    \Log::warning('Investor not found for webhook', ['investor_id' => $investorId]);
                }
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
        return DB::transaction(function () use ($application_id, $month) {
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

            if(!$revenue){
                throw new \Exception('No revenue found for the month');
            }

            //Calculate the monthly repayment amount
            $monthlyRepayment = $revenue * $application->revenue_share_percentage;

            //Check if monthly repayment + total repaid is greater than the repayment cap
            if ($monthlyRepayment + $application->total_repaid > $application->repayment_cap) {
                $monthlyRepayment = $application->repayment_cap - $application->total_repaid;
            }

            Stripe::setApiKey(config('stripe.secret'));

            try {
                // Step 1: Create PaymentIntent (startup pays to platform)
                $paymentIntent = PaymentIntent::create([
                    'amount' => $monthlyRepayment * 100,
                    'currency' => 'myr',
                    'payment_method_types' => ['card'],
                    'payment_method' => 'pm_card_visa',
                    'confirm' => true,
                    'description' => 'Monthly repayment from startup to platform',
                    'on_behalf_of' => $startup->stripe_id,
                    'application_fee_amount' => 0,
                    'metadata' => [
                        'application_id' => $application->id,
                        'startup_id' => $startup->id,
                        'repayment_type' => 'monthly_repayment',
                        'month' => $month
                    ],
                ], [
                    'stripe_account' => $startup->stripe_id, // Acts on behalf of startup
                ]);

                // Check if payment was successful
                if (!$paymentIntent) {
                    throw new \Exception('Payment failed: ' . $paymentIntent);
                }

                // Step 2: Get actual available balance and transfer
                $platformBalance = $this->getPlatformBalance();
                $availableBalance = $platformBalance['available_balance'];
                
                if ($availableBalance <= 0) {
                    throw new \Exception('Insufficient platform balance for transfer. Available: ' . $availableBalance);
                }
                
                $transfer = Transfer::create([
                    'amount' => $availableBalance * 100, // Use actual available amount
                    'currency' => 'myr',
                    'destination' => $investor->stripe_id,
                    'description' => 'Monthly repayment to investor',
                    'metadata' => [
                        'application_id' => $application->id,
                        'startup_id' => $startup->id,
                        'payment_intent_id' => $paymentIntent->id,
                        'repayment_type' => 'monthly_repayment'
                    ]
                ]);

                // Update application total_repaid immediately
                $application->total_repaid = $this->getTotalRepaid($application_id);
                $application->save();

                // Update application status if completed
                if ($application->total_repaid >= $application->repayment_cap) {
                    $application->status = 'Completed';
                    $application->save();
                }

                // Insert transaction record
                Transaction::create([
                    'amount' => $availableBalance, // Actual amount transferred
                    'type' => 'REPAYMENT',
                    'transaction_datetime' => now(),
                    'from_stripe_id' => $startup->stripe_id,
                    'to_stripe_id' => $investor->stripe_id,
                    'status' => 'Completed',
                    'application_id' => $application->id,
                ]);

                \Log::info('Monthly repayment processed successfully', [
                    'payment_intent_id' => $paymentIntent->id,
                    'transfer_id' => $transfer->id,
                    'amount' => $availableBalance,
                    'application_id' => $application->id,
                    'status' => 'completed'
                ]);

                return [
                    'payment_intent' => $paymentIntent,
                    'transfer' => $transfer,
                    'status' => 'completed'
                ];

            } catch (\Exception $e) {
                throw new \Exception('Stripe repayment transfer failed: ' . $e->getMessage());
            }
        });
    }

    public function getTotalRepaid($application_id)
    {
        return Transaction::where('application_id', $application_id)
            ->where('type', 'REPAYMENT')
            ->where('status', 'Completed')
            ->sum('amount');
    }

    public function getPlatformBalance()
    {
        Stripe::setApiKey(config('stripe.secret'));
        
        try {
            $balance = Balance::retrieve();
            
            $availableBalance = 0;
            foreach ($balance->available as $balanceItem) {
                if ($balanceItem->currency === 'myr') {
                    $availableBalance += $balanceItem->amount / 100; // Convert from cents
                }
            }
            
            return [
                'available_balance' => $availableBalance,
                'pending_balance' => $balance->pending,
                'instant_available' => $balance->instant_available,
                'raw_balance' => $balance
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to retrieve platform balance: ' . $e->getMessage());
        }
    }
} 