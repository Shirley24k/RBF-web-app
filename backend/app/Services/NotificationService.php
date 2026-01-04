<?php

namespace App\Services;

use App\Models\Application;
use App\Services\MailService;

class NotificationService
{
    private $mailService;

    public function __construct(MailService $mailService)
    {
        $this->mailService = $mailService;
    }

    /**
     * Send repayment reminder
     */
    public function sendRepaymentReminder(int $application_id): array
    {
        try {
            $application = Application::with(['startup.user', 'investor'])->findOrFail($application_id);
            
            $result = $this->mailService->sendRepaymentReminder($application);
            
            return [
                'success' => true,
                'message' => 'Repayment reminder sent successfully',
                'data' => $result
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to send repayment reminder',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send investor top-up reminder
     */
    public function sendInvestorTopupReminder(int $application_id): array
    {
        try {
            $application = Application::with(['startup.user', 'investor.user'])->findOrFail($application_id);
            
            $result = $this->mailService->sendInvestorTopupReminder($application);
            
            return [
                'success' => true,
                'message' => 'Investor top-up reminder sent successfully',
                'data' => $result
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to send investor top-up reminder',
                'error' => $e->getMessage()
            ];
        }
    }
}
