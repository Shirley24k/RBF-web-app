<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Startup;
use App\Models\Investor;
use App\Services\UserService;
use App\Services\StartupService;
use App\Services\InvestorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    protected $userService;
    protected $startupService;
    protected $investorService;

    public function __construct(
        UserService $userService,
        StartupService $startupService,
        InvestorService $investorService
    ) {
        $this->userService = $userService;
        $this->startupService = $startupService;
        $this->investorService = $investorService;
    }

    /**
     * Create a startup account (admin only)
     */
    public function createStartupAccount(Request $request): JsonResponse
    {
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'contact_no' => 'required|string|max:20',
            'company_name' => 'required|string|max:255',
            'company_sector' => 'required|string|max:100',
            'company_address' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'startup'
            ]);

            // Send email verification
            $user->sendEmailVerificationNotification();

            // Create startup record
            $startup = Startup::create([
                'name' => $request->name,
                'contact_no' => $request->contact_no,
                'company_name' => $request->company_name,
                'company_sector' => $request->company_sector,
                'company_address' => $request->company_address,
                'user_id' => $user->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Startup account created successfully. Please check the email address for verification instructions.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => $user->role
                    ],
                    'startup' => [
                        'id' => $startup->id,
                        'name' => $startup->name,
                        'company_name' => $startup->company_name,
                        'contact_no' => $startup->contact_no,
                        'company_sector' => $startup->company_sector,
                        'company_address' => $startup->company_address
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create startup account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create an investor account (admin only)
     */
    public function createInvestorAccount(Request $request): JsonResponse
    {
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
        }

        $validator = Validator::make($request->all(), [
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
            'password' => 'required|string|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'investor'
            ]);

            // Send email verification
            $user->sendEmailVerificationNotification();

            // Create investor record
            $investor = Investor::create([
                'type' => $request->type,
                'name' => $request->name,
                'contact_no' => $request->contact_no,
                'country' => $request->country,
                'company_address' => $request->company_address,
                'investment_preferences' => $request->investment_preferences,
                'user_id' => $user->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Investor account created successfully. Please check the email address for verification instructions.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => $user->role
                    ],
                    'investor' => [
                        'id' => $investor->id,
                        'type' => $investor->type,
                        'name' => $investor->name,
                        'contact_no' => $investor->contact_no,
                        'country' => $investor->country,
                        'company_address' => $investor->company_address,
                        'investment_preferences' => $investor->investment_preferences
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create investor account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users for admin management
     */
    public function getAllUsers(): JsonResponse
    {
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
        }

        try {
            $users = User::with(['startup', 'investor', 'staff'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    $userData = [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => $user->role,
                        'email_verified_at' => $user->email_verified_at,
                        'created_at' => $user->created_at,
                        'profile' => null
                    ];

                    if ($user->role === 'startup' && $user->startup) {
                        $startup = $user->startup;
                        $userData['profile'] = [
                            'type' => 'startup',
                            'name' => $startup->name,
                            'company_name' => $startup->company_name,
                            'contact_no' => $startup->contact_no,
                            'company_sector' => $startup->company_sector,
                            'company_address' => $startup->company_address
                        ];
                    } elseif ($user->role === 'investor' && $user->investor) {
                        $investor = $user->investor;
                        $userData['profile'] = [
                            'type' => 'investor',
                            'name' => $investor->name,
                            'contact_no' => $investor->contact_no,
                            'country' => $investor->country,
                            'company_address' => $investor->company_address,
                            'investment_preferences' => $investor->investment_preferences
                        ];
                    } elseif ($user->role === 'staff' && $user->staff) {
                        $staff = $user->staff;
                        $startupCompanyName = null;
                        $startupId = null;
                        $startupOwnerUserId = null;
                        if ($staff->startup_id) {
                            $startupId = $staff->startup_id;
                            $startupModel = Startup::find($startupId);
                            if ($startupModel) {
                                $startupCompanyName = $startupModel->company_name;
                                $startupOwnerUserId = $startupModel->user_id;
                            }
                        }
                        $userData['profile'] = [
                            'type' => 'staff',
                            'name' => $staff->name,
                            'position' => $staff->position ?? null,
                            'permissions' => $staff->permissions ?? null,
                            'status' => $staff->status ?? null,
                            'startup_id' => $startupId,
                            'startup_company_name' => $startupCompanyName,
                            'startup_user_id' => $startupOwnerUserId,
                        ];
                    }

                    return $userData;
                });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password (admin only)
     */
    public function changeUserPassword(Request $request): JsonResponse
    {
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'new_password' => 'required|string|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($request->user_id);
            
            // Update password
            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to change password: ' . $e->getMessage()
            ], 500);
        }
    }
}
