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

        // Determine the base month for calculation: either current or next
        $year = $today->year;
        $month = $today->month;

        // Create a Carbon instance for the potential repayment date in the current month
        $potentialThisMonthRepayment = Carbon::createSafe($year, $month, min($application->repayment_date, Carbon::create($year, $month, 1)->daysInMonth));

        // Check if this month's repayment has been paid AND if the potential repayment date for this month is today or in the past.
        if ($this->hasRepaymentForMonth($application, $potentialThisMonthRepayment->format('Y-m'))) {
            // If this month was paid, move to the next month for the next due date
            $nextMonthRepayment = $potentialThisMonthRepayment->copy()->addMonth();
            $nextMonthRepayment->day = min($application->repayment_date, $nextMonthRepayment->daysInMonth);
            return $nextMonthRepayment->startOfDay();
        }

        // If this month's repayment is due today or in the past, and it's NOT paid, return it (it's overdue or due today)
        if ($potentialThisMonthRepayment->lessThanOrEqualTo($today)) {
            return $potentialThisMonthRepayment->startOfDay();
        }

        // If the current month's repayment date is in the future AND it's not paid yet, then that's the next repayment date
        return $potentialThisMonthRepayment->startOfDay();
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
        $monthly_revenue = $this->stripeService->getMonthlyRevenue($application->startup->stripe_id, now()->format('Y-m'));
        $repayment_amount = $monthly_revenue * $application->revenue_share_percentage;
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
