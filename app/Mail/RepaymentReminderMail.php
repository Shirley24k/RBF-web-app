<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Application;
use App\Services\RepaymentService;

class RepaymentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $application;
    public $dueDate;
    public $repaymentAmount;
    public $daysUntilDue;

    /**
     * Create a new message instance.
     */
    public function __construct(Application $application, $dueDate = null)
    {
        $this->application = $application;
        
        $repaymentService = app(RepaymentService::class);
        $this->dueDate = $dueDate ?? $repaymentService->getNextRepaymentDate($application);
        $this->repaymentAmount = $repaymentService->calculateRepaymentAmount($application);
        
        // Calculate days until due
        $today = now();
        $this->daysUntilDue = $today->diffInDays($this->dueDate, false); 
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->daysUntilDue > 0 
            ? "Reminder: Repayment Due in {$this->daysUntilDue} days" 
            : "URGENT: Repayment Overdue";

        return $this->subject($subject)
                    ->view('emails.repayment-reminder');
    }
}
