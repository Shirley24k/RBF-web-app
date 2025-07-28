<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Application;

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
        $this->dueDate = $dueDate ?? $application->getNextRepaymentDate();
        $this->repaymentAmount = $application->calculateRepaymentAmount();
        
        // Calculate days until due
        $today = now();
        $this->daysUntilDue = $today->diffInDays($this->dueDate, false); // false = absolute value
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
