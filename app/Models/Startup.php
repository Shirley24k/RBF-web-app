<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Startup
 *
 * @mixin IdeHelperStartup
 * @property int $id
 * @property string $name
 * @property string $contact_no
 * @property string $company_name
 * @property string $company_sector
 * @property string $company_address
 * @property string|null $stripe_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Application> $applications
 * @property-read int|null $applications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Proposal> $proposals
 * @property-read int|null $proposals_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder|Startup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Startup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Startup query()
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereCompanyAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereCompanySector($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereContactNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereStripeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Startup whereUserId($value)
 * @mixin \Eloquent
 */
class Startup extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'contact_no',
        'company_name',
        'company_sector',
        'company_address',
        'stripe_id',
        'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function proposals()
    {
        return $this->hasMany(Proposal::class);
    }

    public function staff()
    {
        return $this->hasMany(Staff::class);
    }


}
