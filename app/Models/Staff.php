<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'startup_id',
        'name',
        'position',
        'permissions',
        'status',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    // Available permissions for staff
    public const PERMISSIONS = [
        // Profile Management
        'view_profile' => 'View Company Profile',
        'change_password' => 'Change Password',
        
        // Proposal Management
        'view_proposal' => 'View Proposals',
        'create_proposal' => 'Create Proposals',
        'edit_proposal' => 'Edit Proposals',
        
        // Application Management
        'view_applications' => 'View Applications',
        'view_agreement' => 'View Agreement',

        // Transaction Management
        'view_transactions' => 'View Transactions'
    ];

    // Restricted actions (only startup owner can perform)
    public const RESTRICTED_ACTIONS = [
        'link_stripe_account',
        'review_proposal',        // Only startup owner can review proposals
        'create_applications',    // Only startup owner can create applications
        'select_investor',        // Only startup owner can select investors
        'upload_agreement',       // Only startup owner can upload agreements
        'make_repayment',         // Only startup owner can make repayments
        'delete_staff',           // Only startup owner can delete staff
        'change_staff_permissions' // Only startup owner can change staff permissions
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function startup()
    {
        return $this->belongsTo(Startup::class);
    }

    /**
     * Check if staff has a specific permission
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions ?? []);
    }



    /**
     * Check if action is restricted (only startup owner can perform)
     */
    public static function isRestrictedAction(string $action): bool
    {
        return in_array($action, self::RESTRICTED_ACTIONS);
    }

    /**
     * Get all available permissions
     */
    public static function getAvailablePermissions(): array
    {
        return self::PERMISSIONS;
    }

    /**
     * Get all restricted actions
     */
    public static function getRestrictedActions(): array
    {
        return self::RESTRICTED_ACTIONS;
    }
}
