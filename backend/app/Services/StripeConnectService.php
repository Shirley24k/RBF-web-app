<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\User;

class StripeConnectService
{
    /**
     * Process Stripe OAuth callback and return redirect URL or error.
     */
    public function processOAuthCallback(string $code, ?string $state): array
    {
        // Exchange code for access data with Stripe
        $response = Http::withOptions([
            'verify' => false,
        ])->asForm()->post('https://connect.stripe.com/oauth/token', [
            'client_secret' => config('stripe.secret'),
            'code' => $code,
            'grant_type' => 'authorization_code',
        ]);

        $data = $response->json();

        if (isset($data['error'])) {
            return [
                'success' => false,
                'message' => 'Stripe connect failed.',
                'error' => $data['error_description'] ?? $data['error']
            ];
        }

        if (!isset($data['stripe_user_id'])) {
            return [
                'success' => false,
                'message' => 'Invalid Stripe response.',
                'error' => 'Missing stripe_user_id in response'
            ];
        }

        // Resolve user from state
        $user = null;
        if ($state) {
            try {
                $stateData = json_decode(base64_decode($state), true);
                if (isset($stateData['user_id'])) {
                    $user = User::find($stateData['user_id']);
                }
            } catch (\Exception $e) {
                \Log::warning('Invalid Stripe OAuth state parameter', [
                    'state' => $state,
                    'error' => $e->getMessage()
                ]);
            }
        }

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Authentication required',
                'error' => 'Please log in to complete Stripe connection.',
                'redirect_url' => config('app.frontend_url') . '/login?error=Please log in to complete Stripe connection.'
            ];
        }

        // Save stripe id to associated profile
        $stripeUserId = $data['stripe_user_id'];
        if ($user->role === 'startup') {
            $startup = $user->startup()->first();
            if (!$startup) {
                return [
                    'success' => false,
                    'message' => 'Startup profile not found.',
                    'error' => 'No startup profile associated with this user'
                ];
            }
            $startup->stripe_id = $stripeUserId;
            $startup->save();
            return [
                'success' => true,
                'redirect_url' => config('app.frontend_url') . '/startup-home?stripe_linked=1'
            ];
        }

        if ($user->role === 'investor') {
            $investor = $user->investor()->first();
            if (!$investor) {
                return [
                    'success' => false,
                    'message' => 'Investor profile not found.',
                    'error' => 'No investor profile associated with this user'
                ];
            }
            $investor->stripe_id = $stripeUserId;
            $investor->save();
            return [
                'success' => true,
                'redirect_url' => config('app.frontend_url') . '/investor-home?stripe_linked=1'
            ];
        }

        return [
            'success' => false,
            'message' => 'Invalid user role.',
            'error' => 'User role must be either startup or investor'
        ];
    }
}


