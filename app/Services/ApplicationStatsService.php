<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Investor;
use App\Models\Startup;

class ApplicationStatsService
{
	public function getGlobalStats(): array
	{
		return [
			'total' => Application::count(),
			'await_review' => Application::where('status', 'Await Review')->count(),
			'ongoing' => Application::whereIn('status', ['Await Review', 'Pending', 'In Progress', 'Active'])->count(),
			'pending' => Application::where('status', 'Pending')->count(),
			'in_progress' => Application::where('status', 'In Progress')->count(),
			'active' => Application::where('status', 'Active')->count(),
			'failed' => Application::whereIn('status', ['Failed', 'Rejected'])->count(),
			'completed' => Application::where('status', 'Completed')->count(),
			'total_startups' => Startup::count(),
			'total_investors' => Investor::count(),
			'total_funding_amount' => Application::with('proposal')
			->whereIn('status', ['Active', 'Completed'])
			->get()
			->sum(function($application) {
				return $application->proposal->funding_amount ?? 0;
			}),
		];
	}

	public function getStartupStats(int $startupId): array
	{
		return [
			'total' => Application::where('startup_id', $startupId)->count(),
			'await_review' => Application::where('startup_id', $startupId)->where('status', 'Await Review')->count(),
			'ongoing' => Application::where('startup_id', $startupId)->whereIn('status', ['Await Review', 'Pending', 'In Progress', 'Active'])->count(),
			'pending' => Application::where('startup_id', $startupId)->where('status', 'Pending')->count(),
			'in_progress' => Application::where('startup_id', $startupId)->where('status', 'In Progress')->count(),
			'active' => Application::where('startup_id', $startupId)->where('status', 'Active')->count(),
			'failed' => Application::where('startup_id', $startupId)->whereIn('status', ['Failed', 'Rejected'])->count(),
			'completed' => Application::where('startup_id', $startupId)->where('status', 'Completed')->count(),
			'total_funding_received' => Application::with('proposal')
			->where('startup_id', $startupId)
			->whereIn('status', ['Active', 'Completed'])
			->get()
			->sum(function($application) {
				return $application->proposal->funding_amount ?? 0;
			}),
		];
	}

	public function getInvestorStats(int $investorId): array
	{
		$investor = Investor::find($investorId);
		return [
			'total' => Application::where('investor_id', $investorId)->count(),
			'await_review' => Application::where('investor_id', $investorId)->where('status', 'Await Review')->count(),
			'ongoing' => Application::where('investor_id', $investorId)->whereIn('status', ['Await Review', 'Pending', 'In Progress', 'Active'])->count(),
			'pending' => Application::where('investor_id', $investorId)->where('status', 'Pending')->count(),
			'in_progress' => Application::where('investor_id', $investorId)->where('status', 'In Progress')->count(),
			'active' => Application::where('investor_id', $investorId)->where('status', 'Active')->count(),
			'failed' => Application::where('investor_id', $investorId)->whereIn('status', ['Failed', 'Rejected'])->count(),
			'completed' => Application::where('investor_id', $investorId)->where('status', 'Completed')->count(),
			'total_invested' => Application::with('proposal')
			->where('investor_id', $investorId)
			->whereIn('status', ['Active', 'Completed'])
			->get()
			->sum(function($application) {
				return $application->proposal->funding_amount ?? 0;
			}),
			'investor_balance' => $investor ? $investor->balance : 0,
		];
	}
}


