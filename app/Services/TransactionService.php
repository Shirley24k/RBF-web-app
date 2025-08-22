<?php

namespace App\Services;

use App\Models\Application;
use App\Services\RepaymentService;
use App\Services\StripeService;
use Illuminate\Http\Request;
use App\Models\Investor;
use App\Models\Transaction;

class TransactionService
{
	private RepaymentService $repaymentService;
	private StripeService $stripeService;

	public function __construct(RepaymentService $repaymentService, StripeService $stripeService)
	{
		$this->repaymentService = $repaymentService;
		$this->stripeService = $stripeService;
	}

	public function getTransactionDetails(int $applicationId): array
	{
		$application = Application::with(['startup', 'investor', 'transactions'])->findOrFail($applicationId);
		$transactions = $application->transactions()->orderBy('transaction_datetime', 'desc')->get();
		$next_repayment_date = $this->repaymentService->getNextRepaymentDate($application);
		$overdue_details = $this->repaymentService->getOverduePaymentDetails($application);
		
		return [
			'application' => $application,
			'startup' => $application->startup,
			'investor' => $application->investor,
			'transactions' => $transactions,
			'next_repayment_date' => $next_repayment_date,
			'overdue_details' => $overdue_details,
			'repayment_amount' => $this->repaymentService->calculateRepaymentAmount($application) ?: 0,
		];
	}

	public function createDummyTransactions(string $month): array
	{
		try {
			$result = $this->stripeService->createDummyTransactions($month);
			return [
				'success' => true,
				'message' => 'Dummy transactions created successfully',
				'data' => $result->getData(true)
			];
		} catch (\Exception $e) {
			return [
				'success' => false,
				'message' => 'Failed to create dummy transactions',
				'error' => $e->getMessage()
			];
		}
	}



	/**
	 * Process webhook events and handle business logic
	 */
	public function processWebhookEvent(Request $request): void
	{
		$payload = $request->getContent();
		$sig_header = $request->header('Stripe-Signature');
		
		try {
			$event = \Stripe\Webhook::constructEvent(
				$payload, $sig_header, config('stripe.webhook_secret')
			);
		} catch (\Exception $e) {
			\Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
			throw new \Exception('Webhook signature verification failed');
		}

		if ($event->type === 'checkout.session.completed') {
			$session = $event->data->object;
			$transactionType = $session->metadata->type ?? null;

			if ($transactionType === 'fund transfer') {
				$this->handleTopUpWebhook($session);
			} else if ($transactionType === 'monthly_repayment') {
				$this->handleMonthlyRepaymentWebhook($session);
			}
		}
	}

	/**
	 * Handle investor top-up webhook
	 */
	private function handleTopUpWebhook($session): void
	{
		$amountMyr = $session->metadata->topup_amount / 100; // Convert from cents to MYR
		$investor = Investor::where('user_id', $session->metadata->investor_id)->first();
		
		if ($investor) {
			$investor->balance += $amountMyr;
			$investor->save();
			\Log::info('Investor balance updated via webhook', [
				'investor_id' => $investor->id,
				'amount' => $amountMyr,
				'session_id' => $session->id
			]);
		} else {
			\Log::warning('Investor not found for webhook', [
				'investor_id' => $session->metadata->investor_id ?? 'unknown',
				'session_id' => $session->id
			]);
		}
	}

	/**
	 * Handle monthly repayment webhook
	 */
	private function handleMonthlyRepaymentWebhook($session): void
	{
		try {
			$applicationId = $session->metadata->application_id ?? null;
			$startupId = $session->metadata->startup_id ?? null;
			$investorId = $session->metadata->investor_id ?? null;
			$month = $session->metadata->month ?? null;
			$targetAmount = $session->metadata->target_repayment_amount ?? 0;

			if (!$applicationId || !$startupId || !$investorId) {
				\Log::error('Missing metadata for monthly repayment webhook', [
					'session_id' => $session->id,
					'metadata' => $session->metadata
				]);
				return;
			}

			$application = Application::with(['startup', 'investor'])->find($applicationId);
			if (!$application) {
				\Log::error('Application not found for monthly repayment webhook', ['application_id' => $applicationId]);
				return;
			}

			// Insert transaction record with Pending status
			Transaction::create([
				'amount' => $targetAmount,
				'type' => 'REPAYMENT',
				'transaction_datetime' => now(),
				'from_stripe_id' => $application->startup->stripe_id,
				'to_stripe_id' => $application->investor->stripe_id,
				'status' => 'Pending', // Mark as pending until transfer completes
				'application_id' => $applicationId,
			]);

			\Log::info('Monthly repayment webhook processed - transaction created with Pending status', [
				'application_id' => $applicationId,
				'amount' => $targetAmount,
				'session_id' => $session->id,
				'note' => 'Run: php artisan transfers:process-delayed to process transfer after 3 minutes'
			]);

		} catch (\Exception $e) {
			\Log::error('Error processing monthly repayment webhook', [
				'session_id' => $session->id,
				'error' => $e->getMessage()
			]);
		}
	}
}


