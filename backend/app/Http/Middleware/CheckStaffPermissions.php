<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Staff;

class CheckStaffPermissions
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = auth()->user();
        
        // If user is startup owner, allow access
        if ($user->role === 'startup' || $user->role === 'investor' || $user->role === 'admin') {
            return $next($request);
        }
        
        // If user is staff, check permissions
        if ($user->role === 'staff') {
            $staff = $user->staff()->first();
            
            if (!$staff || $staff->status !== 'ACTIVE') {
                return response()->json([
                    'error' => 'Staff member not found or inactive'
                ], 403);
            }
            
            // Check if action is restricted (only startup owner can perform)
            if (Staff::isRestrictedAction($permission)) {
                return response()->json([
                    'error' => 'This action is restricted to startup owners only'
                ], 403);
            }
            
            // Check if staff has the required permission
            if (!$staff->hasPermission($permission)) {
                return response()->json([
                    'error' => 'Insufficient permissions to perform this action'
                ], 403);
            }
            
            return $next($request);
        }
        
        return response()->json([
            'error' => 'Unauthorized access'
        ], 403);
    }
}
