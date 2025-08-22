<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use App\Services\StripeConnectService;

class UserController extends Controller
{
    protected $stripeConnectService;

    public function __construct(StripeConnectService $stripeConnectService)
    {
        $this->stripeConnectService = $stripeConnectService;
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
            $result = $this->stripeConnectService->processOAuthCallback(
                $request->code,
                $request->get('state')
            );

            if (!($result['success'] ?? false)) {
                // If a redirect url is provided, redirect; otherwise return JSON error
                if (isset($result['redirect_url'])) {
                    return redirect($result['redirect_url']);
                }
                return response()->json([
                    'message' => $result['message'] ?? 'Stripe connect failed.',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            return redirect($result['redirect_url']);
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
