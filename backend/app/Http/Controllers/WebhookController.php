<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\StripeService;
use App\Services\TransactionService;

class WebhookController extends Controller
{
    private $stripeService;
    private $transactionService;

    public function __construct(StripeService $stripeService, TransactionService $transactionService)
    {
        $this->stripeService = $stripeService;
        $this->transactionService = $transactionService;
    }

    public function handleStripeWebhook(Request $request): JsonResponse
    {
        try {
            $result = $this->stripeService->handleStripeWebhook($request);
            
            if ($result['success']) {
                // Process business logic for successful webhook
                $this->transactionService->processWebhookEvent($request);
                return response()->json(['message' => 'Webhook processed successfully'], 200);
            } else {
                return response()->json(['message' => $result['message']], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process webhook',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
