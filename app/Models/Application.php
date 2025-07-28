<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Services\StripeService;
use Carbon\Carbon;


class Application extends Model
{
    protected $fillable = [
        'startup_id',
        'investor_id',
        'proposal_path',
        'funding_amount',
        'funding_stage',
        'funding_purpose',
        'revenue_share_percentage',
        'repayment_cap',
        'total_repaid',
        'cap_multiple',
        'message',
        'status',
        'repayment_date'
    ];

    /**
     * Get the next repayment date based on the stored repayment_date (day of month),
     * but never before the first repayment date (fund transfer date + 30 days).
     */

    public function getNextRepaymentDate()
    {
        if ($this->status != 'Active') {
            return null;
        }

        if (!$this->repayment_date) {
            return null;
        }

        $fundTransfer = $this->transactions()
            ->where('type', 'FUND_TRANSFER')
            ->first();

        if (!$fundTransfer) {
            return null;
        }

        $firstRepaymentDate = Carbon::parse($fundTransfer->transaction_datetime)->addDays(30)->startOfDay(); // Add startOfDay for consistent comparison
        $today = now()->startOfDay(); // Compare start of day for accurate 'today' checks

        // If today is before the first repayment, return the first repayment date
        if ($today->lt($firstRepaymentDate)) {
            return $firstRepaymentDate;
        }

        // Determine the base month for calculation: either current or next
        $year = $today->year;
        $month = $today->month;

        // Create a Carbon instance for the potential repayment date in the current month
        $potentialThisMonthRepayment = Carbon::createSafe($year, $month, min($this->repayment_date, Carbon::create($year, $month, 1)->daysInMonth));

        // IMPORTANT: Check if this month's repayment has been paid AND if the potential repayment date for this month is today or in the past.
        // This handles the scenario where a payment is made exactly on the due date.
        if ($this->hasRepaymentForMonth($potentialThisMonthRepayment->format('Y-m'))) {
            // If this month was paid, move to the next month for the next due date
            $nextMonthRepayment = $potentialThisMonthRepayment->copy()->addMonth();
            $nextMonthRepayment->day = min($this->repayment_date, $nextMonthRepayment->daysInMonth);
            return $nextMonthRepayment->startOfDay(); // Return start of day for next month
        }

        // If this month's repayment is due today or in the past, and it's NOT paid, return it (it's overdue or due today)
        if ($potentialThisMonthRepayment->lessThanOrEqualTo($today)) {
             // If not paid, this is the overdue date
            return $potentialThisMonthRepayment->startOfDay();
        }

        // If the current month's repayment date is in the future AND it's not paid yet, then that's the next repayment date
        return $potentialThisMonthRepayment->startOfDay();
    }

    /**
     * Check if there's a repayment transaction for a specific month
     */
    public function hasRepaymentForMonth($month)
    {
        return $this->transactions()
            ->where('type', 'REPAYMENT')
            ->where('status', 'Completed')
            ->whereYear('transaction_datetime', substr($month, 0, 4))
            ->whereMonth('transaction_datetime', substr($month, 5, 2))
            ->exists();
    }

    /**
     * Check if today is a repayment day for this application
     */
    public function isRepaymentDay()
    {
        $nextRepayment = $this->getNextRepaymentDate();
        if (!$nextRepayment) {
            return false;
        }
        return $nextRepayment->isToday();
    }

    /**
     * Check if the application has overdue payments
     */
    public function hasOverduePayments()
    {
        $nextRepayment = $this->getNextRepaymentDate();
        if (!$nextRepayment) {
            return false;
        }
        
        return $nextRepayment->isPast();
    }

    /**
     * Get overdue payment details
     */
    public function getOverduePaymentDetails()
    {
        if ($this->status != 'Active') {
            return null;
        }

        if (!$this->hasOverduePayments()) {
            return null;
        }

        $nextRepayment = $this->getNextRepaymentDate();
        $daysOverdue = $nextRepayment->diffInDays(now());

        return [
            'overdue_date' => $nextRepayment->format('Y-m-d'),
            'days_overdue' => $daysOverdue,
            'is_overdue' => true
        ];
    }

    public function calculateRepaymentAmount()
    {
        $monthly_revenue = StripeService::getMonthlyRevenue($this->startup->stripe_id, now()->format('Y-m'));
        $repayment_amount = $monthly_revenue * $this->revenue_share_percentage;
        return $repayment_amount;
    }

    public function startup()
    {
        return $this->belongsTo(Startup::class);
    }

    public function investor()
    {
        return $this->belongsTo(Investor::class);
    }

    public function agreement()
    {
        return $this->hasOne(Agreement::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
} 