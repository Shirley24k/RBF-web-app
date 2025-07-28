<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use App\Mail\RepaymentReminderMail;
use App\Mail\InvestorTopupReminderMail;
use App\Models\Application;

class MailService
{
    /**
     * Send repayment reminder email
     */
    public function sendRepaymentReminder(Application $application, $dueDate = null)
    {
        try {
            $startupEmail = $application->startup->user->email;
            
            Mail::to($startupEmail)->send(new RepaymentReminderMail($application, $dueDate));
            
            return [
                'success' => true,
                'message' => 'Repayment reminder sent successfully',
                'to' => $startupEmail,
                'application_id' => $application->id
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to send repayment reminder: ' . $e->getMessage(),
                'application_id' => $application->id
            ];
        }
    }

    /**
     * Send investor top-up reminder email
     */
    public function sendInvestorTopupReminder(Application $application, $requiredAmount = null)
    {
        try {
            $investorEmail = $application->investor->user->email;

            Mail::to($investorEmail)->send(new InvestorTopupReminderMail($application, $requiredAmount));
            
            return [
                'success' => true,
                'message' => 'Investor top-up reminder sent successfully',
                'to' => $investorEmail,
                'application_id' => $application->id
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to send investor top-up reminder: ' . $e->getMessage(),
                'application_id' => $application->id
            ];
        }
    }

    /**
     * Send repayment reminders for all due applications
     */
    // public function sendRepaymentReminders()
    // {
    //     $applications = Application::where('status', 'Active')
    //         ->with(['startup.user', 'investor'])
    //         ->get();

    //     $results = [];
        
    //     foreach ($applications as $application) {
    //         $nextRepaymentDate = $application->getNextRepaymentDate();
            
    //         if ($nextRepaymentDate) {
    //             $daysUntilDue = now()->diffInDays($nextRepaymentDate, false);
                
    //             // Send reminder if due within 3 days or overdue
    //             if ($daysUntilDue <= 3) {
    //                 $result = $this->sendRepaymentReminder($application, $nextRepaymentDate);
    //                 $results[] = $result;
    //             }
    //         }
    //     }
        
    //     return $results;
    // }
} 