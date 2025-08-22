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
use App\Http\Controllers\WebhookController;

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

// ============================================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================================

// Registration routes
Route::post('/register/investor', [InvestorController::class, 'store']);
Route::post('/register/startup', [StartupController::class, 'store']);

// Stripe routes
Route::get('/stripe/oauth/callback', [UserController::class, 'handleOAuthCallback']);
Route::post('/stripe/webhook', [WebhookController::class, 'handleStripeWebhook']);

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

// ============================================================================
// PROTECTED ROUTES (Authentication Required)
// ============================================================================

Route::middleware('auth:sanctum')->group(function () {
    
    // User profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ============================================================================
    // INVESTOR ROUTES
    // ============================================================================
    
    // Profile & balance
    Route::get('/investor/profile', [InvestorController::class, 'show']);
    Route::get('/investor/balance', [InvestorController::class, 'getInvestorBalance']);
    Route::patch('/investor/update-preferences', [InvestorController::class, 'updatePreferences']);
    
    // Applications
    Route::get('/investor/applications', [ApplicationController::class, 'getApplicationsForInvestor']);
    Route::get('/investor/applications-await-review', [ApplicationController::class, 'getInvestorAwaitReviewApplications']);
    Route::get('/investor/recent-applications', [ApplicationController::class, 'getRecentApplicationsForInvestor']);
    Route::get('/investor/transaction-applications', [ApplicationController::class, 'getTransactionApplicationsForInvestor']);
    
    // Transactions
    Route::post('/investor/top-up', [TransactionController::class, 'topUpAccount']);

    
    // ============================================================================
    // STARTUP ROUTES
    // ============================================================================
    
    // Profile
    Route::get('/startup/profile', [StartupController::class, 'show']);
    
    // Application workflow
    Route::post('/startup/submit-funding', [ApplicationController::class, 'submitApplication']);
    Route::post('/startup/analyze-proposal', [ApplicationController::class, 'analyzeProposal']);
    Route::get('/startup/applications', [ApplicationController::class, 'getApplicationsForStartup']);
    Route::get('/startup/recent-applications', [ApplicationController::class, 'getRecentApplicationsForStartup']);
    Route::get('/startup/transaction-applications', [ApplicationController::class, 'getTransactionApplicationsForStartup']);
    
    //Transactions
    Route::post('/transactions/repayment', [TransactionController::class, 'processMonthlyRepayment']);

    // ============================================================================
    // ADMIN ROUTES
    // ============================================================================
    
    Route::get('/applications', [ApplicationController::class, 'getAllApplications']);
    Route::get('/pending-applications', [ApplicationController::class, 'getPendingApplications']);
    Route::get('/application-stats', [ApplicationController::class, 'getApplicationStats']);

    // ============================================================================
    // ROUTES WITH ID PARAMETERS (Must be at bottom to avoid conflicts)
    // ============================================================================
    
    // Investor routes with ID
    Route::get('/investor/{id}', [InvestorController::class, 'getInvestorById']);
    
    // Application routes with ID
    Route::post('/startup/assess-risk/{application_id}', [ApplicationController::class, 'assessRisk']);
    Route::post('/startup/match-investors/{application_id}', [ApplicationController::class, 'matchInvestors']);
    Route::patch('/startup/select-investor/{application_id}', [ApplicationController::class, 'selectInvestor']);
    Route::get('/application/{id}', [ApplicationController::class, 'getApplication']);
    Route::patch('/application/{id}/accept', [ApplicationController::class, 'acceptApplication']);
    Route::patch('/application/{id}/reject', [ApplicationController::class, 'rejectApplication']);
    Route::patch('/application/{id}/admin-approve', [AgreementController::class, 'adminApproveApplication']);
    Route::patch('/application/{id}/admin-decline', [AgreementController::class, 'adminDeclineApplication']);
    
    // Agreement routes with ID
    Route::get('/agreement/{application_id}', [AgreementController::class, 'getAgreement']);
    Route::post('/investor/upload-agreement/{application_id}', [AgreementController::class, 'uploadAgreement']);
    Route::post('/startup/upload-agreement/{application_id}', [AgreementController::class, 'uploadAgreement']);
    
    // Transaction routes with ID
    Route::get('/transaction-details/{application_id}', [TransactionController::class, 'getTransactionDetails']);
    
    // Repayment reminder
    Route::post('/repayment-reminder/{application_id}', [ApplicationController::class, 'sendRepaymentReminder']);

    // Top-up reminder
    Route::post('/investor-topup-reminder/{application_id}', [ApplicationController::class, 'sendInvestorTopupReminder']);
});

// ============================================================================
// DEVELOPMENT/TEST ROUTES
// ============================================================================

Route::post('/dummy-transactions', [TransactionController::class, 'createDummyTransactions']);
