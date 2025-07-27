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
use App\Http\Controllers\AgreementController;
use App\Http\Controllers\TransactionController;

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

// Stripe OAuth callback route (no authentication required) - for Standard accounts
Route::get('/stripe/oauth/callback', [UserController::class, 'handleOAuthCallback']);

// Stripe webhook route (no authentication required)
Route::post('/stripe/webhook', [TransactionController::class, 'handleStripeWebhook']);

// Process monthly repayment
Route::post('/transactions/repayment', [TransactionController::class, 'processMonthlyRepayment']);

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
    Route::get('/investor/profile/', [InvestorController::class, 'show']);
    Route::get('/investor/balance', [InvestorController::class, 'getInvestorBalance']);
    Route::post('/investor/top-up', [TransactionController::class, 'topUpAccount']);
    // Route::post('/investor/update-balance', [TransactionController::class, 'updateInvestorBalance']);
    
    // Transaction routes
    Route::patch('/investor/update-preferences', [InvestorController::class, 'updatePreferences']);
    Route::get('/investor/applications', [ApplicationController::class, 'getApplicationsForInvestor']);
    Route::get('/investor/applications-await-review', [ApplicationController::class, 'getInvestorAwaitReviewApplications']);
    Route::post('/investor/upload-agreement/{application_id}', [AgreementController::class, 'uploadAgreement']);
    Route::patch('/application/{id}/accept', [ApplicationController::class, 'acceptApplication']);
    Route::patch('/application/{id}/reject', [ApplicationController::class, 'rejectApplication']);
    Route::get('/investor/{id}', [InvestorController::class, 'getInvestorById']);
    // Startup routes
    Route::get('/startup/profile', [StartupController::class, 'show']);
    Route::post('/startup/submit-funding', [ApplicationController::class, 'submitApplication']);
    Route::get('/startup/applications', [ApplicationController::class, 'getApplicationsForStartup']);
    Route::post('/startup/upload-agreement/{application_id}', [AgreementController::class, 'uploadAgreement']);
    Route::patch('/startup/select-investor/{application_id}', [ApplicationController::class, 'selectInvestor']);

    // Admin routes
    Route::get('/applications', [ApplicationController::class, 'getAllApplications']);
    Route::get('/pending-applications', [ApplicationController::class, 'getPendingApplications']);
    Route::patch('/application/{id}/admin-approve', [AgreementController::class, 'adminApproveApplication']);
    Route::patch('/application/{id}/admin-decline', [AgreementController::class, 'adminDeclineApplication']);
    
    // Agreement routes
    Route::get('/agreement/{application_id}', [AgreementController::class, 'getAgreement']);
});

//Insert dummy transactions, This route needs to be manually executed
Route::post('/dummy-transactions', [TransactionController::class, 'createDummyTransactions']);
