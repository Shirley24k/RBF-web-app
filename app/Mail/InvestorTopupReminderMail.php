<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Application;

class InvestorTopupReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $application;
    public $requiredAmount;
    public $currentBalance;
    public $shortfall;

    /**
     * Create a new message instance.
     */
    public function __construct(Application $application, $requiredAmount = null)
    {
        $this->application = $application;
        $this->requiredAmount = $requiredAmount ?? $application->funding_amount;
        $this->currentBalance = $application->investor->balance ?? 0;
        $this->shortfall = max(0, $this->requiredAmount - $this->currentBalance);
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = "Action Required: Top up RM " . number_format($this->shortfall, 2) . " to proceed with fund transfer";

        return $this->subject($subject)
                    ->view('emails.investor-topup-reminder');
    }
} 