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
            $startup = $this->startupService->getCurrentStartup();
            return response()->json([
                'data' => $startup
            ], 200);
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
            'password' => 'required|min:8'
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

    public function updateProfile(Request $request): JsonResponse
    {
        $malaysianStates = [
            'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
            'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
            'Kuala Lumpur', 'Labuan', 'Putrajaya'
        ];

        $validationRules = [
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
        ];

        // Add password validation if password is provided
        if ($request->has('password') && $request->password) {
            $validationRules['password'] = 'required|min:8';
            $validationRules['confirm_password'] = 'required|same:password';
        }

        $validated = $request->validate($validationRules);

        try {
            $user = auth()->user();
            $startup = $user->startup;

            if (!$startup) {
                return response()->json([
                    'message' => 'Startup profile not found'
                ], 404);
            }

            // Update startup profile
            $startup->update([
                'name' => $validated['name'],
                'contact_no' => $validated['contact_no'],
                'company_name' => $validated['company_name'],
                'company_sector' => $validated['company_sector'],
                'company_address' => $validated['company_address'],
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
                'data' => $startup->fresh()
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
