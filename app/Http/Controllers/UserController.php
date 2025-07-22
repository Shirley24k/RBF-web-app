<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use Stripe\Stripe;
use Stripe\Charge;

class UserController extends Controller
{
    public function handleOAuthCallback(Request $request)
    {
        // Validate request
        if (!$request->has('code')) {
            return response()->json([
                'message' => 'Stripe authorization failed.',
                'error' => 'Missing authorization code'
            ], 400);
        }

        try {
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->asForm()->post('https://connect.stripe.com/oauth/token', [
                'client_secret' => config('stripe.secret'),
                'code' => $request->code,
                'grant_type' => 'authorization_code',
            ]);
        
            $data = $response->json();

            // Check for Stripe API errors
            if (isset($data['error'])) {
                return response()->json([
                    'message' => 'Stripe connect failed.',
                    'error' => $data['error_description'] ?? $data['error']
                ], 400);
            }

            // Validate required data
            if (!isset($data['stripe_user_id'])) {
                return response()->json([
                    'message' => 'Invalid Stripe response.',
                    'error' => 'Missing stripe_user_id in response'
                ], 400);
            }

            // Try to get user from authentication first
            $user = auth()->user();
            
            // If user is not authenticated, try to get from state parameter
            if (!$user) {
                $state = $request->get('state');
                
                if ($state && $state !== 'secure-random-state') {
                    // Decode user info from state parameter
                    try {
                        $stateData = json_decode(base64_decode($state), true);
                        if (isset($stateData['user_id'])) {
                            $user = User::find($stateData['user_id']);
                        }
                    } catch (\Exception $e) {
                        // State parameter is not valid JSON, ignore
                    }
                }
                
                // For now, let's try to get user from email in Stripe parameters
                // This is a temporary solution until you update the frontend
                if (!$user && $request->has('stripe_user')) {
                    $stripeUserEmail = $request->get('stripe_user')['email'] ?? null;
                    if ($stripeUserEmail) {
                        $user = User::where('email', $stripeUserEmail)->first();
                    }
                }
                
                // If still no user found, redirect to login
                if (!$user) {
                    return redirect('http://localhost:5173/login')->with('error', 'Please log in to complete Stripe connection.');
                }
            }

            if ($user->role === 'startup') {
                $startup = $user->startups()->first();
                if ($startup) {
                    $startup->stripe_id = $data['stripe_user_id'];
                    $startup->save();
                    return redirect('http://localhost:5173/startup-home?stripe_linked=1');
                } else {
                    return response()->json([
                        'message' => 'Startup profile not found.',
                        'error' => 'No startup profile associated with this user'
                    ], 404);
                }
            } elseif ($user->role === 'investor') {
                $investor = $user->investors()->first();
                if ($investor) {
                    $investor->stripe_id = $data['stripe_user_id'];
                    $investor->save();
                    return redirect('http://localhost:5173/investor-home?stripe_linked=1');
                } else {
                    return response()->json([
                        'message' => 'Investor profile not found.',
                        'error' => 'No investor profile associated with this user'
                    ], 404);
                }
            } else {
                return response()->json([
                    'message' => 'Invalid user role.',
                    'error' => 'User role must be either startup or investor'
                ], 400);
            }
        } catch (\Illuminate\Http\Client\RequestException $e) {
            // Handle HTTP request errors (network issues, timeouts, etc.)
            return response()->json([
                'message' => 'Stripe API request failed.',
                'error' => 'Unable to connect to Stripe: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            // Handle other unexpected errors
            return response()->json([
                'message' => 'An unexpected error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createDummyTransactions()
    {
        Stripe::setApiKey(config('stripe.secret'));
        $months = [
            '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'
        ];
    
        $charges = [];
    
        foreach ($months as $month) {
            // Create 10 transactions per month
            for ($i = 1; $i <= 10; $i++) {
                $charge = \Stripe\Charge::create([
                    'amount' => rand(1000, 10000) * 100, 
                    'currency' => 'myr',
                    'source' => 'tok_visa', // test token
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
        }

        return response()->json([
            'message' => 'Dummy transactions created successfully',
            'charges' => $charges
        ]);
    }

    public function getTransactions(Request $request)
    {
        Stripe::setApiKey(config('stripe.secret'));
        
        $transactions = \Stripe\Charge::all([], [
            'stripe_account' => $request->stripe_id,
        ]);

        return $transactions;
    }
}
