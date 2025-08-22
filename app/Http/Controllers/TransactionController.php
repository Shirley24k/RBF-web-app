<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\TransactionService;
use App\Services\RepaymentService;
use App\Services\InvestorService;

class TransactionController extends Controller
{
    private $transactionService;
    private $repaymentService;
    private $investorService;

    public function __construct(
        TransactionService $transactionService,
        RepaymentService $repaymentService,
        InvestorService $investorService
    ) {
        $this->transactionService = $transactionService;
        $this->repaymentService = $repaymentService;
        $this->investorService = $investorService;
    }

    public function getTransactionDetails($application_id): JsonResponse
    {
        try {
            $data = $this->transactionService->getTransactionDetails((int)$application_id);
            return response()->json($data, 200);
        } catch(\Exception $e) {
            return response()->json([
                'message' => 'Failed to get transaction details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createDummyTransactions(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|string',
        ]);

        try {
            $result = $this->transactionService->createDummyTransactions($request->month);
            
            if ($result['success']) {
                return response()->json($result, 200);
            } else {
                return response()->json($result, 500);
            }
        } catch(\Exception $e) {
            return response()->json([
                'message' => 'Failed to create dummy transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function topUpAccount(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        try {
            $result = $this->investorService->topUpAccount($request->amount);
            
            if ($result['success']) {
                return response()->json([
                    'checkout_url' => $result['checkout_url'] ?? null,
                ], 200);
            } else {
                return response()->json($result, 500);
            }
        } catch(\Exception $e) {
            return response()->json([
                'message' => 'Failed to top up account',
                'error' => $e->getMessage()
            ], 500);
        }
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



    public function processMonthlyRepayment(Request $request): JsonResponse
    {
        $request->validate([
            'application_id' => 'required|exists:applications,id',
            'month' => 'required|string',
        ]);

        try {
            $result = $this->repaymentService->processMonthlyRepayment(
                $request->application_id, 
                $request->month
            );

            return response()->json([
                'message' => 'Monthly repayment processed successfully',
                'checkout_url' => $result['checkout_url'],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process monthly repayment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
