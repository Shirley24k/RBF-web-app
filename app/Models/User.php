<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Startup;
use App\Models\Investor;
use App\Models\Staff;

/**
 * App\Models\User
 *
 * @mixin IdeHelperUser
 * @property int $id
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Investor> $investors
 * @property-read int|null $investors_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Startup> $startups
 * @property-read int|null $startups_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'password',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public $timestamps = true;

    public function startup()
    {
        return $this->hasOne(Startup::class);
    }

    public function investor()
    {
        return $this->hasOne(Investor::class);
    }

    public function staff()
    {
        return $this->hasOne(Staff::class);
    }

    /**
     * Check if user is startup owner
     */
    public function isStartupOwner(): bool
    {
        return $this->startup()->exists();
    }

    /**
     * Check if user is investor
     */
    public function isInvestor(): bool
    {
        return $this->investor()->exists();
    }

    /**
     * Check if user is staff member
     */
    public function isStaff(): bool
    {
        return $this->staff()->exists();
    }

    /**
     * Check if user can access startup features (owner or staff)
     */
    public function canAccessStartupFeatures(): bool
    {
        return $this->isStartupOwner() || $this->isStaff();
    }

    /**
     * Get the startup ID that this user can access
     */
    public function getAccessibleStartupId(): ?int
    {
        if ($this->isStartupOwner()) {
            return $this->startup->id;
        }
        
        if ($this->isStaff()) {
            return $this->staff->startup_id;
        }
        
        return null;
    }
}
