<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Startup;
use App\Services\StartupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StartupController extends Controller
{
    protected $startupService;

    public function __construct(StartupService $startupService)
    {
        $this->startupService = $startupService;
    }

    public function show(): JsonResponse
    {
        try {
            $startup = Startup::where('user_id', auth()->user()->id)->first();
            return response()->json([
                'data' => $startup
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Startup not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $malaysianStates = [
            'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
            'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
            'Kuala Lumpur', 'Labuan', 'Putrajaya'
        ];

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_no' => [
                'required',
                'string',
                'max:20',
                function ($attribute, $value, $fail) {
                    if (strpos($value, '+60') !== 0) {
                        $fail('Your company is not eligible to use our platform.');
                    }
                }
            ],
            'company_name' => 'required|string|max:255',
            'company_sector' => 'required|string|max:100',
            'company_address' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($malaysianStates) {
                    $found = false;
                    foreach ($malaysianStates as $state) {
                        if (stripos($value, $state) !== false) {
                            $found = true;
                            break;
                        }
                    }
                    if (!$found) {
                        $fail('Your company is not eligible to use our platform.');
                    }
                }
            ],
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        try {
            $startup = $this->startupService->createStartup($validated);

            return response()->json([
                'message' => 'Startup created successfully',
                'data' => $startup
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create startup',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
}
