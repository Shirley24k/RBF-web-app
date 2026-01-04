<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use App\Services\StripeConnectService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

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

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => [ 'current_password' => ['Current password is incorrect'] ],
            ], 422);
        }

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Test route for staff permissions and user information
     */
    public function getUserProfile(Request $request)
    {
        $user = $request->user();
        $response = [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'is_startup_owner' => $user->isStartupOwner(),
            'is_investor' => $user->isInvestor(),
        ];

        if ($user->isStartupOwner()) {
            $startup = $user->startup()->first();
            $response['startup'] = [
                'id' => $startup->id,
                'name' => $startup->name,
                'staff_count' => $startup->staff()->count()
            ];
        }

        if ($user->staff()->exists()) {
            $staff = $user->staff()->first();
            $response['staff'] = [
                'id' => $staff->id,
                'name' => $staff->name,
                'position' => $staff->position,
                'permissions' => $staff->permissions,
                'status' => $staff->status
            ];
        }

        return response()->json($response);
    }
}
