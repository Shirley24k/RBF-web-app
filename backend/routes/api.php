<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\StartupController;
use App\Http\Controllers\InvestorController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AgreementController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProposalReviewController;

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

Route::get('/verify-email/{id}/{hash}', [VerifyEmailController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
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
    Route::get('/user', [UserController::class, 'getUserProfile']);


    // Change password route (for all authenticated users)
    Route::post('/change-password', [UserController::class, 'changePassword'])->middleware('staff.permission:change_password');

    // ============================================================================
    // INVESTOR ROUTES
    // ============================================================================
    
    // Profile & balance
    Route::get('/investor/profile', [InvestorController::class, 'show']);
    Route::put('/investor/profile', [InvestorController::class, 'updateProfile']);
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
    // STARTUP ROUTES (Startup Owners + Staff Members)
    // ============================================================================
    
    // Profile
    Route::get('/startup/profile', [StartupController::class, 'show'])->middleware('staff.permission:view_profile');
    Route::put('/startup/profile', [StartupController::class, 'updateProfile']); // Restricted to startup owners only
    
    // Application workflow
    Route::post('/startup/submit-funding', [ApplicationController::class, 'submitApplication'])->middleware('staff.permission:create_applications'); // Restricted to startup owners only
    Route::get('/startup/applications', [ApplicationController::class, 'getApplicationsForStartup'])->middleware('staff.permission:view_applications');
    Route::get('/startup/recent-applications', [ApplicationController::class, 'getRecentApplicationsForStartup'])->middleware('staff.permission:view_applications');
    Route::get('/startup/transaction-applications', [ApplicationController::class, 'getTransactionApplicationsForStartup'])->middleware('staff.permission:view_transactions');
    
    // Proposal management
    Route::post('/extract-proposal', [ProposalController::class, 'extractProposal'])->middleware('staff.permission:create_proposal');
    Route::get('/startup/proposals', [ProposalController::class, 'getProposals'])->middleware('staff.permission:view_proposal');
    Route::get('/startup/reviewed-proposals', [ProposalController::class, 'getReviewedProposals']);
    Route::post('/startup/proposals', [ProposalController::class, 'createProposal'])->middleware('staff.permission:create_proposal');

    
    // Transactions (startup owners only - restricted action)
    Route::post('/transactions/repayment', [TransactionController::class, 'processMonthlyRepayment'])->middleware('staff.permission:make_repayment');
    Route::post('/transactions/process-success', [TransactionController::class, 'processSuccessRepayment'])->middleware('staff.permission:make_repayment');

    // ============================================================================
    // ADMIN ROUTES
    // ============================================================================
    
    Route::get('/applications', [ApplicationController::class, 'getAllApplications'])->middleware('staff.permission:view_applications');
    Route::get('/pending-applications', [ApplicationController::class, 'getPendingApplications'])->middleware('staff.permission:view_applications');
    Route::get('/application-stats', [ApplicationController::class, 'getApplicationStats']);
    Route::get('/monthly-chart-data', [ApplicationController::class, 'getMonthlyChartData']);
    
    // Admin account management routes
    Route::prefix('admin')->group(function () {
        Route::post('/create-startup-account', [AdminController::class, 'createStartupAccount']);
        Route::post('/create-investor-account', [AdminController::class, 'createInvestorAccount']);
        Route::get('/users', [AdminController::class, 'getAllUsers']);
        Route::post('/change-user-password', [AdminController::class, 'changeUserPassword']);
    });

    // ============================================================================
    // ROUTES WITH ID PARAMETERS (Must be at bottom to avoid conflicts)
    // ============================================================================
    
    // Investor routes with ID
    Route::get('/investor/{id}', [InvestorController::class, 'getInvestorById']);
    
    // Application routes with ID
    Route::post('/startup/assess-risk/{application_id}', [ApplicationController::class, 'assessRisk'])->middleware('staff.permission:create_applications');
    Route::post('/startup/match-investors/{application_id}', [ApplicationController::class, 'matchInvestors'])->middleware('staff.permission:create_applications');
    Route::patch('/startup/select-investor/{application_id}', [ApplicationController::class, 'selectInvestor'])->middleware('staff.permission:select_investor');
    Route::get('/application/{id}', [ApplicationController::class, 'getApplication']);
    Route::patch('/application/{id}/accept', [ApplicationController::class, 'acceptApplication']);
    Route::patch('/application/{id}/reject', [ApplicationController::class, 'rejectApplication']);
    Route::patch('/application/{id}/admin-approve', [AgreementController::class, 'adminApproveApplication']);
    Route::patch('/application/{id}/admin-decline', [AgreementController::class, 'adminDeclineApplication']);

    // Proposal routes with ID
    Route::get('/startup/proposals/{id}', [ProposalController::class, 'getProposalById'])->middleware('staff.permission:view_proposal');
    Route::put('/startup/proposals/{id}', [ProposalController::class, 'updateProposal'])->middleware('staff.permission:edit_proposal');
    Route::get('/proposals/{proposalId}/reviews', [ProposalReviewController::class, 'show'])->middleware('staff.permission:add_review');
    Route::put('/startup/review-proposals/{id}', [ProposalController::class, 'reviewProposal'])->middleware('staff.permission:review_proposal');
    
    // Proposal review routes
    Route::post('/startup/reviews/{proposalId}', [ProposalReviewController::class, 'store'])->middleware('staff.permission:add_review');
    Route::patch('/startup/reviews/{proposalId}/resolution', [ProposalReviewController::class, 'updateResolution'])->middleware('staff.permission:review_proposal');
    
    // Agreement routes with ID
    Route::get('/agreement/{application_id}', [AgreementController::class, 'getAgreement'])->middleware('staff.permission:view_agreement');
    Route::post('/investor/upload-agreement/{application_id}', [AgreementController::class, 'uploadAgreement']);
    Route::post('/startup/upload-agreement/{application_id}', [AgreementController::class, 'uploadAgreement'])->middleware('staff.permission:upload_agreement');
    
    // Transaction routes with ID
    Route::get('/transaction-details/{application_id}', [TransactionController::class, 'getTransactionDetails'])->middleware('staff.permission:view_transactions');
    
    // Repayment reminder
    Route::post('/repayment-reminder/{application_id}', [ApplicationController::class, 'sendRepaymentReminder']);

    // Top-up reminder
    Route::post('/investor-topup-reminder/{application_id}', [ApplicationController::class, 'sendInvestorTopupReminder']);

    // Staff management (startup owners only)
    Route::prefix('staff')->group(function () {
        Route::get('/', [StaffController::class, 'index']);
        Route::post('/', [StaffController::class, 'store']);
        Route::get('/permissions', [StaffController::class, 'getPermissions']);
        Route::put('/{id}', [StaffController::class, 'update']);
        Route::delete('/{id}', [StaffController::class, 'destroy']);
        
        // Staff proposal review routes
        Route::post('/proposals/{proposalId}/responses', [ProposalReviewController::class, 'storeResponseForStaff'])->middleware('staff.permission:add_review');
    });

});

// ============================================================================
// DEVELOPMENT/TEST ROUTES
// ============================================================================

Route::post('/dummy-transactions', [TransactionController::class, 'createDummyTransactions']);
