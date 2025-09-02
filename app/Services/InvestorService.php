<?php

namespace App\Services;

use App\Models\Investor;
use App\Models\User;
use App\Models\ScmInvestor;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Services\StripeService;

class InvestorService
{
    protected $userService;
    protected $stripeService;

    public function __construct(UserService $userService, StripeService $stripeService)
    {
        $this->userService = $userService;
        $this->stripeService = $stripeService;
    }

    public function getCurrentInvestor(): Investor
    {
        $investor = Investor::where('user_id', auth()->user()->id)->first();
        if (!$investor) {
            throw new Exception('Investor not found');
        }
        return $investor;
    }

    public function getInvestorById(int $id): Investor
    {
        $investor = Investor::where('id', $id)->first();
        if (!$investor) {
            throw new Exception('Investor not found');
        }
        return $investor;
    }

    public function getCurrentInvestorBalance(): float
    {
        $investor = $this->getCurrentInvestor();
        return (float) $investor->balance;
    }

    public function validateScmInvestor(string $name)
    {
        // Check if the name exists as a substring in any SCM investor name
        $exists = ScmInvestor::where('name', 'ILIKE', '%' . $name . '%')
            ->orWhere(function($query) use ($name) {
                $query->whereRaw('? ILIKE CONCAT(\'%\', name, \'%\')', [$name]);
            })
            ->exists();
        
        return [
            'exists' => $exists,
            'message' => $exists 
                ? 'We have found you in the SCM investor alert list. 
                Your registration cannot be processed at this time. 
                Please contact support for assistance.' 
                : 'Investor validation successful.'
        ];
    }

    public function createInvestor(array $data)
    {
        // First check SCM validation
        $scmValidation = $this->validateScmInvestor($data['name']);
        if ($scmValidation['exists']) {
            throw new Exception($scmValidation['message']);
        }

        return DB::transaction(function () use ($data) {
            // Create user record
            $user = $this->userService->createUser($data, 'investor');

            // Create investor record
            $investor = Investor::create([
                'type' => $data['type'],
                'name' => $data['name'],
                'contact_no' => $data['contact_no'],
                'country' => $data['country'] ?? null,
                'company_address' => $data['company_address'] ?? null,
                'investment_preferences' => $data['investment_preferences'],
                'validation_status' => true, 
                'user_id' => $user->id
            ]);

            return $investor;
        });
    }

    public function updatePreferences(array $data)
    {
        $investor = Investor::where('user_id', auth()->user()->id)->first();
        $investor->investment_preferences = $data['investment_preferences'];
        $investor->save();
        return $investor;
    }

    public function topUpAccount(float $amount): array
    {
        try {
            $result = $this->stripeService->topUpAccount($amount);
            return [
                'success' => true,
                'message' => 'Top-up session created successfully',
                'checkout_url' => $result['checkout_url']
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create top-up session',
                'error' => $e->getMessage()
            ];
        }
    }
} 