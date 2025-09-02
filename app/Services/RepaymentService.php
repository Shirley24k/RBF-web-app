<?php

namespace App\Services;

use App\Models\Application;
use Carbon\Carbon;
use App\Services\StripeService;

class RepaymentService
{
    private StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Get the next repayment date based on the stored repayment_date (day of month),
     * but never before the first repayment date (fund transfer date + 30 days).
     */
    public function getNextRepaymentDate(Application $application): ?Carbon
    {
        if ($application->status != 'Active') {
            return null;
        }

        if (!$application->repayment_date) {
            return null;
        }

        $fundTransfer = $application->transactions()
            ->where('type', 'FUND_TRANSFER')
            ->first();

        if (!$fundTransfer) {
            return null;
        }

        $firstRepaymentDate = Carbon::parse($fundTransfer->transaction_datetime)->addDays(30)->startOfDay();
        $today = now()->startOfDay();

        // If today is before the first repayment, return the first repayment date
        if ($today->lt($firstRepaymentDate)) {
            return $firstRepaymentDate;
        }

        // Get the last completed repayment to determine the next due date
        $lastRepayment = $application->transactions()
            ->where('type', 'REPAYMENT')
            ->where('status', 'Completed')
            ->orderBy('transaction_datetime', 'desc')
            ->first();

        if ($lastRepayment) {
            // Calculate the next repayment date based on the repayment schedule, not the actual completion date
            $fundTransferDate = Carbon::parse($fundTransfer->transaction_datetime);
            $firstRepaymentDate = $fundTransferDate->copy()->addDays(30);
            
            // Count how many repayments have been completed
            $completedRepaymentsCount = $application->transactions()
                ->where('type', 'REPAYMENT')
                ->where('status', 'Completed')
                ->count();
            
            // The next repayment should be (completedRepaymentsCount + 1) months after the first repayment
            $nextRepaymentDate = $firstRepaymentDate->copy()->addMonths($completedRepaymentsCount);
            $nextRepaymentDate->day = min($application->repayment_date, $nextRepaymentDate->daysInMonth);
            
            // Due or overdue
            if ($nextRepaymentDate->lessThanOrEqualTo($today)) {
                return $nextRepaymentDate->startOfDay();
            }
            
            return $nextRepaymentDate->startOfDay();
        } else {
            // No repayments yet, use the first repayment date
            return $firstRepaymentDate;
        }
    }

    /**
     * Check if there's a repayment transaction for a specific month
     */
    public function hasRepaymentForMonth(Application $application, string $month): bool
    {
        return $application->transactions()
            ->where('type', 'REPAYMENT')
            ->where('status', 'Completed')
            ->whereYear('transaction_datetime', substr($month, 0, 4))
            ->whereMonth('transaction_datetime', substr($month, 5, 2))
            ->exists();
    }

    /**
     * Check if today is a repayment day for this application
     */
    public function isRepaymentDay(Application $application): bool
    {
        $nextRepayment = $this->getNextRepaymentDate($application);
        if (!$nextRepayment) {
            return false;
        }
        return $nextRepayment->isToday();
    }

    /**
     * Check if the application has overdue payments
     */
    public function hasOverduePayments(Application $application): bool
    {
        $nextRepayment = $this->getNextRepaymentDate($application);
        if (!$nextRepayment) {
            return false;
        }
        
        return $nextRepayment->isPast();
    }

    /**
     * Get overdue payment details
     */
    public function getOverduePaymentDetails(Application $application): ?array
    {
        if ($application->status != 'Active') {
            return null;
        }

        if (!$this->hasOverduePayments($application)) {
            return null;
        }

        $nextRepayment = $this->getNextRepaymentDate($application);
        $daysOverdue = $nextRepayment->diffInDays(now());

        return [
            'overdue_date' => $nextRepayment->format('Y-m-d'),
            'days_overdue' => $daysOverdue,
            'is_overdue' => true
        ];
    }

    /**
     * Calculate the repayment amount for an application
     */
    public function calculateRepaymentAmount(Application $application): float
    {
        // Get the next repayment date to determine which month's revenue to use
        $nextRepaymentDate = $this->getNextRepaymentDate($application);
        
        if ($nextRepaymentDate) {
            // Use the month of the next repayment date
            $revenueMonth = $nextRepaymentDate->format('Y-m');
        } else {
            // Fallback to current month if no next repayment date
            $revenueMonth = now()->format('Y-m');
        }
        \Log::info('Startup stripe id: ' . $application->startup->stripe_id);
        $monthly_revenue = $this->stripeService->getMonthlyRevenue($application->startup->stripe_id, $revenueMonth);
        \Log::info('Monthly revenue: ' . $monthly_revenue);
        $repayment_amount = $monthly_revenue * ($application->revenue_share_percentage / 100);
        \Log::info('Revenue share percentage: ' . $application->revenue_share_percentage);
        \Log::info('Repayment amount: ' . $repayment_amount);
        return $repayment_amount;
    }

    /**
     * Process monthly repayment for an application
     */
    public function processMonthlyRepayment(int $applicationId, string $month)
    {
        $application = Application::findOrFail($applicationId);
        
        // Validate that the application is active
        if ($application->status !== 'Active') {
            throw new \Exception('Application is not active');
        }

        // Check if repayment for this month already exists
        if ($this->hasRepaymentForMonth($application, $month)) {
            throw new \Exception('Repayment for this month already processed');
        }

        // Process the repayment through Stripe
        return $this->stripeService->processMonthlyRepayment($applicationId, $month);
    }
}
