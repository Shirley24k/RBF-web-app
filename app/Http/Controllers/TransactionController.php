<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\StripeService;

class TransactionController extends Controller
{
    private $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    public function createDummyTransactions(Request $request)
    {
        $this->stripeService->createDummyTransactions($request->month);
    }

    public function topUpAccount(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);
        $session = $this->stripeService->topUpAccount($request->amount);
        return response()->json([
            'checkout_url' => $session->getData(true)['checkout_url'],
        ]);
    }

    // public function updateInvestorBalance(Request $request)
    // {
    //     try{
    //         $session = $this->stripeService->updateBalance($request->session_id);
    //         return response()->json([
    //             'message' => 'Investor balance updated successfully',
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Failed to update investor balance',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    //update investor balance when top up success
    public function handleStripeWebhook(Request $request)
    {
        return $this->stripeService->handleStripeWebhook($request);
    }

    public function processMonthlyRepayment(Request $request)
    {
        $request->validate([
            'application_id' => 'required|exists:applications,id',
            'month' => 'required|string',
        ]);

        try {
            $result = $this->stripeService->processMonthlyRepayment(
                $request->application_id, 
                $request->month
            );

            return response()->json([
                'message' => 'Monthly repayment processed successfully',
                'payment_intent_id' => $result['payment_intent']->id ?? 'null',
                'transfer_id' => $result['transfer']->id ?? 'null',
                'status' => $result['status'] ?? 'null',
                'month' => $request->month
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process monthly repayment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
