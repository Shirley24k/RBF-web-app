<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\StartupController;
use App\Http\Controllers\InvestorController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes (no authentication required)
Route::post('/register/investor', [InvestorController::class, 'store']);
Route::post('/register/startup', [StartupController::class, 'store']);

// Stripe OAuth callback route (no authentication required)
Route::get('/stripe/oauth/callback', [UserController::class, 'handleOAuthCallback']);

// Authentication routes
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('guest')
    ->name('password.email');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('password.update');

Route::get('/verify-email/{id}/{hash}', [VerifyEmailController::class, '__invoke'])
    ->middleware(['auth:sanctum', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->name('logout');

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Application routes
    Route::get('/application/{id}', [ApplicationController::class, 'getApplication']);
    
    // Investor routes
    Route::get('/investor/profile', [InvestorController::class, 'show']);
    Route::patch('/investor/update-preferences', [InvestorController::class, 'updatePreferences']);
    Route::get('/investor/applications', [ApplicationController::class, 'getApplicationsForInvestor']);
    Route::post('/investor/upload-agreement/{application_id}', [ApplicationController::class, 'uploadAgreement']);
    Route::patch('/application/{id}/accept', [ApplicationController::class, 'acceptApplication']);
    Route::patch('/application/{id}/reject', [ApplicationController::class, 'rejectApplication']);
    
    // Startup routes
    Route::get('/startup/profile', [StartupController::class, 'show']);
    Route::post('/startup/submit-funding', [ApplicationController::class, 'submitApplication']);
    Route::get('/startup/applications', [ApplicationController::class, 'getApplicationsForStartup']);
    Route::post('/startup/upload-agreement/{application_id}', [ApplicationController::class, 'uploadAgreement']);
    Route::post('/dummy-transactions', [UserController::class, 'createDummyTransactions']);

    // Admin routes
    Route::get('/applications', [ApplicationController::class, 'getAllApplications']);
    Route::get('/pending-applications', [ApplicationController::class, 'getPendingApplications']);
    Route::patch('/application/{id}/admin-approve', [ApplicationController::class, 'adminApproveApplication']);
    Route::patch('/application/{id}/admin-decline', [ApplicationController::class, 'adminDeclineApplication']);

    
});
