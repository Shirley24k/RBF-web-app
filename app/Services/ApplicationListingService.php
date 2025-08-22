<?php

namespace App\Services;

use App\Models\Application;
use App\Services\RepaymentService;

class ApplicationListingService
{
	private FileUploadService $fileUploadService;
	private RepaymentService $repaymentService;

	public function __construct(FileUploadService $fileUploadService, RepaymentService $repaymentService)
	{
		$this->fileUploadService = $fileUploadService;
		$this->repaymentService = $repaymentService;
	}

	public function listForStartup(int $startupId)
	{
		$applications = Application::where('startup_id', $startupId)
			->with('investor')
			->orderBy('updated_at', 'desc')
			->get();

		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
				'investor_name' => $application->investor ? $application->investor->name : null,
				'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
				'status' => $application->status,
				'proposal_url' => $this->retrieveSignedUrl('business-proposal', $application->proposal_path),
			];
		});
	}

	public function listRecentForStartup(int $startupId, int $limit = 3)
	{
		$applications = Application::where('startup_id', $startupId)
			->with('investor')
			->orderBy('updated_at', 'desc')
			->limit($limit)
			->get();

		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
				'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
				'status' => $application->status,
			];
		});
	}

	public function listTransactionForStartup(int $startupId)
	{
		$applications = Application::where('startup_id', $startupId)
			->whereIn('status', ['Active', 'Completed'])
			->with('investor')
			->orderBy('updated_at', 'desc')
			->get();

		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
				'investor_name' => $application->investor ? $application->investor->name : null,
				'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
				'status' => $application->status,
			];
		});
	}

	public function listForInvestor(int $investorId)
	{
		$applications = Application::where('investor_id', $investorId)
			->with('startup')
			->orderBy('updated_at', 'desc')
			->get();

		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
				'startup_name' => $application->startup ? $application->startup->name : null,
				'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
				'status' => $application->status,
				'proposal_url' => $this->retrieveSignedUrl('business-proposal', $application->proposal_path),
			];
		});
	}

	public function listInvestorAwaitReview(int $investorId)
	{
		$applications = Application::where('investor_id', $investorId)
			->where('status', 'Await Review')
			->get();

		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
			];
		});
	}

	public function listRecentForInvestor(int $investorId, int $limit = 3)
	{
		$applications = Application::where('investor_id', $investorId)
			->with('investor')
			->orderBy('updated_at', 'desc')
			->limit($limit)
			->get();

		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
				'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
				'status' => $application->status,
			];
		});
	}

	public function listTransactionForInvestor(int $investorId)
	{
		$applications = Application::where('investor_id', $investorId)
			->whereIn('status', ['Active', 'Completed'])
			->with('startup')
			->orderBy('updated_at', 'desc')
			->get();

		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
				'startup_name' => $application->startup ? $application->startup->name : null,
				'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
				'status' => $application->status,
			];
		});
	}

	public function listAll()
	{
		$applications = Application::orderBy('updated_at', 'desc')->get();
		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
				'startup_name' => $application->startup ? $application->startup->name : null,
				'investor_name' => $application->investor ? $application->investor->name : null,
				'date' => $application->updated_at ? $application->updated_at->format('Y-m-d') : null,
				'status' => $application->status,
				'proposal_url' => $this->retrieveSignedUrl('business-proposal', $application->proposal_path),
			];
		});
	}

	public function listPending()
	{
		$applications = Application::where('status', 'Pending')->get();
		return $applications->map(function ($application) {
			return [
				'id' => $application->id,
			];
		});
	}

	public function getApplicationDetails(int $applicationId): array
	{
		$application = Application::with(['startup.user', 'investor.user', 'agreement'])->findOrFail($applicationId);

		$application->startup_agreement_path = $application->agreement ? $application->agreement->startup_agreement_path : null;
		$application->investor_agreement_path = $application->agreement ? $application->agreement->investor_agreement_path : null;
		$application->admin_message = $application->agreement && $application->agreement->message ? $application->agreement->message : null;

		// Signed URLs
		$application->proposal_url = $this->retrieveSignedUrl('business-proposal', $application->proposal_path);
		$application->startup_agreement_url = $this->retrieveSignedUrl('agreement', $application->startup_agreement_path);
		$application->investor_agreement_url = $this->retrieveSignedUrl('agreement', $application->investor_agreement_path);

		$startup = $application->startup;
		if ($startup && $startup->user) {
			$startup->email = $startup->user->email;
		}

		$investor = $application->investor;
		if ($investor && $investor->user) {
			$investor->email = $investor->user->email;
		}

		return [
			'startup' => $startup,
			'investor' => $investor,
			'application' => $application
		];
	}

	private function retrieveSignedUrl(string $bucket, ?string $path): ?string
	{
		if (!$path) {
			return null;
		}
		try {
			return $this->fileUploadService->getSignedUrl($bucket, $path);
		} catch (\Exception $e) {
			return null;
		}
	}
}


