<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Staff;
use App\Models\User;
use App\Models\Startup;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class StaffController extends Controller
{
    /**
     * Display a listing of staff for the authenticated startup owner
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isStartupOwner()) {
            return response()->json(['error' => 'Only startup owners can view staff'], 403);
        }

        $startup = $user->startup()->first();
        if (!$startup) {
            return response()->json(['error' => 'Startup not found'], 404);
        }

        $staff = $startup->staff()
            ->with('user:id,email')
            ->select('id', 'user_id', 'name', 'position', 'permissions', 'status', 'created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $staff,
            'available_permissions' => Staff::getAvailablePermissions(),
            'restricted_actions' => Staff::getRestrictedActions()
        ]);
    }



    /**
     * Store a newly created staff member
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isStartupOwner()) {
            return response()->json(['error' => 'Only startup owners can create staff accounts'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'position' => 'nullable|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'string|in:' . implode(',', array_keys(Staff::PERMISSIONS)),
            'password' => 'required|string|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $startup = $user->startup()->first();
        if (!$startup) {
            return response()->json(['error' => 'Startup not found'], 404);
        }

        try {
            DB::beginTransaction();

            // Create user account
            $newUser = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'staff'
            ]);

            // Send email verification
            $newUser->sendEmailVerificationNotification();

            // Create staff record
            $staff = Staff::create([
                'user_id' => $newUser->id,
                'startup_id' => $startup->id,
                'name' => $request->name,
                'position' => $request->position,
                'permissions' => $request->permissions,
                'status' => 'ACTIVE'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Staff account created successfully. Please check the email address for verification instructions.',
                'data' => $staff->load('user:id,email')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create staff account',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified staff member
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isStartupOwner()) {
            return response()->json(['error' => 'Only startup owners can update staff accounts'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'position' => 'nullable|string|max:255',
            'permissions' => 'sometimes|required|array',
            'permissions.*' => 'string|in:' . implode(',', array_keys(Staff::PERMISSIONS)),
            'status' => 'sometimes|required|in:ACTIVE,INACTIVE'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $startup = $user->startup()->first();
        if (!$startup) {
            return response()->json(['error' => 'Startup not found'], 404);
        }

        $staff = $startup->staff()->find($id);
        if (!$staff) {
            return response()->json(['error' => 'Staff member not found'], 404);
        }

        try {
            $staff->update($request->only(['name', 'position', 'permissions', 'status']));

            return response()->json([
                'success' => true,
                'message' => 'Staff member updated successfully',
                'data' => $staff->load('user:id,email')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update staff member',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified staff member
     */
    public function destroy(int $id): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isStartupOwner()) {
            return response()->json(['error' => 'Only startup owners can remove staff accounts'], 403);
        }

        $startup = $user->startup()->first();
        if (!$startup) {
            return response()->json(['error' => 'Startup not found'], 404);
        }

        $staff = $startup->staff()->find($id);
        if (!$staff) {
            return response()->json(['error' => 'Staff member not found'], 404);
        }

        try {
            // Soft delete by setting status to inactive
            $staff->update(['status' => 'INACTIVE']);

            return response()->json([
                'success' => true,
                'message' => 'Staff member deactivated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to deactivate staff member',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available permissions
     */
    public function getPermissions(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'available_permissions' => Staff::getAvailablePermissions(),
            'restricted_actions' => Staff::getRestrictedActions()
        ]);
    }
}
