<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        try {
            // We will send the password reset link to this user. Once we have attempted
            // to send the link, we will examine the response then see the message we
            // need to show to the user. Finally, we'll send out a proper response.
            $status = Password::sendResetLink(
                $request->only('email')
            );

            if ($status != Password::RESET_LINK_SENT) {
                Log::error('Password reset link failed to send', [
                    'email' => $request->email,
                    'status' => $status
                ]);

                throw ValidationException::withMessages([
                    'email' => [__($status)],
                ]);
            }

            Log::info('Password reset link sent successfully', [
                'email' => $request->email
            ]);

            return response()->json([
                'status' => __($status),
                'message' => 'Password reset link has been sent to your email.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error sending password reset link', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to send password reset link. Please try again.'
            ], 500);
        }
    }
}
