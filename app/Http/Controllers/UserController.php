<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use Stripe\Stripe;
use Stripe\Charge;
use Stripe\Account;
use App\Services\StripeService;

class UserController extends Controller
{
    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Handle OAuth callback for Standard accounts
     */
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

            // Get user from state parameter (since OAuth callback doesn't have auth)
            $user = null;
            $state = $request->get('state');
            
            if ($state) {
                try {
                    $stateData = json_decode(base64_decode($state), true);
                    if (isset($stateData['user_id'])) {
                        $user = User::find($stateData['user_id']);
                    }
                } catch (\Exception $e) {
                    // State parameter is not valid JSON, ignore
                }
            }
            
            // If no user found from state, redirect to login
            if (!$user) {
                return redirect(config('app.frontend_url') . '/login?error=Please log in to complete Stripe connection.');
            }

            // Save the Stripe account ID to the appropriate profile
            if ($user->role === 'startup') {
                $startup = $user->startups()->first();
                if ($startup) {
                    $startup->stripe_id = $data['stripe_user_id'];
                    $startup->save();
                    return redirect(config('app.frontend_url') . '/startup-home?stripe_linked=1');
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
                    return redirect(config('app.frontend_url') . '/investor-home?stripe_linked=1');
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
}
