<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\InvestorService;
use Illuminate\Http\JsonResponse;
use Exception;

class InvestorController extends Controller
{
    protected $investorService;

    public function __construct(InvestorService $investorService)
    {
        $this->investorService = $investorService;
    }

    public function show(): JsonResponse
    {
        try {
            $investor = $this->investorService->getCurrentInvestor();
            return response()->json([
                'data' => $investor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Investor not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function getInvestorById($id): JsonResponse
    {
        try {
            $investor = $this->investorService->getInvestorById((int)$id);
            return response()->json([
                'data' => $investor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Investor not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:individual,firm',
            'name' => 'required|string|max:255',
            'contact_no' => 'required|string|max:20',
            'country' => 'nullable|string|max:100',
            'company_address' => 'nullable|string|max:255',
            'investment_preferences' => 'required|array',
            'investment_preferences.preferred_industry' => 'required|array',
            'investment_preferences.preferred_funding_stage' => 'required|array',
            'investment_preferences.investment_amount_range' => 'required|string',
            'investment_preferences.revenue_share_percentage' => 'required|numeric|min:0|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8'
        ]);

        try {
            $investor = $this->investorService->createInvestor($validated);

            return response()->json([
                'message' => 'Investor created successfully',
                'data' => $investor
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'investment_preferences' => 'required|array',
            'investment_preferences.preferred_industry' => 'required|array',
            'investment_preferences.preferred_funding_stage' => 'required|array',
            'investment_preferences.investment_amount_range' => 'required|string',
            'investment_preferences.revenue_share_percentage' => 'required|numeric|min:0|max:100',
        ]);

        try {
            $investor = $this->investorService->updatePreferences($validated);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }

        return response()->json([
            'message' => 'Preferences updated successfully',
            'data' => $investor
        ], 200);
    }

    public function getInvestorBalance(): JsonResponse
    {
        try{
            $balance = $this->investorService->getCurrentInvestorBalance();
            return response()->json([
                'message' => 'Investor balance retrieved successfully',
                'data' => $balance,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Investor not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validationRules = [
            'type' => 'required|in:individual,firm',
            'name' => 'required|string|max:255',
            'contact_no' => 'required|string|max:20',
            'investment_preferences' => 'required|array',
            'investment_preferences.preferred_industry' => 'required|array',
            'investment_preferences.preferred_funding_stage' => 'required|array',
            'investment_preferences.investment_amount_range' => 'required|string',
            'investment_preferences.revenue_share_percentage' => 'required|numeric|min:0|max:100',
        ];

        // Add conditional validation based on investor type
        if ($request->type === 'individual') {
            $validationRules['country'] = 'required|string|max:100';
        } else {
            $validationRules['company_address'] = 'required|string|max:255';
        }

        // Add password validation if password is provided
        if ($request->has('password') && $request->password) {
            $validationRules['password'] = 'required|min:8';
            $validationRules['confirm_password'] = 'required|same:password';
        }

        $validated = $request->validate($validationRules);

        try {
            $user = auth()->user();
            $investor = $user->investor;

            if (!$investor) {
                return response()->json([
                    'message' => 'Investor profile not found'
                ], 404);
            }

            // Update investor profile
            $investor->update([
                'type' => $validated['type'],
                'name' => $validated['name'],
                'contact_no' => $validated['contact_no'],
                'country' => $validated['country'] ?? null,
                'company_address' => $validated['company_address'] ?? null,
                'investment_preferences' => $validated['investment_preferences'],
            ]);

            // Update password if provided
            if (isset($validated['password'])) {
                $user->update([
                    'password' => bcrypt($validated['password'])
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $investor->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
