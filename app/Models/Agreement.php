<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Agreement
 *
 * @mixin IdeHelperAgreement
 * @property int $id
 * @property string|null $startup_agreement_path
 * @property string|null $investor_agreement_path
 * @property string|null $message
 * @property bool $needs_startup_reupload
 * @property bool $needs_investor_reupload
 * @property int $application_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Application $application
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement query()
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereApplicationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereInvestorAgreementPath($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereNeedsInvestorReupload($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereNeedsStartupReupload($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereStartupAgreementPath($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Agreement whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Agreement extends Model
{
    use HasFactory;
    protected $fillable = [
        'application_id',
        'startup_agreement_path',
        'investor_agreement_path',
        'message',
        'needs_startup_reupload',
        'needs_investor_reupload'
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
