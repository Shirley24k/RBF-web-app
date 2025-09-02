<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Investor
 *
 * @mixin IdeHelperInvestor
 * @property int $id
 * @property string $type
 * @property string $name
 * @property string $contact_no
 * @property string|null $country
 * @property string|null $company_address
 * @property array $investment_preferences
 * @property bool $validation_status
 * @property string|null $stripe_id
 * @property string $balance
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder|Investor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Investor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Investor query()
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereCompanyAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereContactNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereInvestmentPreferences($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereStripeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Investor whereValidationStatus($value)
 * @mixin \Eloquent
 */
class Investor extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'type',
        'name',
        'contact_no',
        'country',
        'company_address',
        'investment_preferences',
        'validation_status',
        'stripe_id',
        'user_id'
    ];

    protected $casts = [
        'investment_preferences' => 'array',
        'validation_status' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
