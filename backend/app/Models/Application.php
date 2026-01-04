<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Investor;
use App\Models\Startup;
use App\Models\Proposal;

/**
 * App\Models\Application
 *
 * @mixin IdeHelperApplication
 * @property int $id
 * @property string $funding_amount
 * @property string|null $funding_stage
 * @property string|null $funding_purpose
 * @property string|null $revenue_share_percentage
 * @property string|null $repayment_cap
 * @property string|null $cap_multiple
 * @property string $total_repaid
 * @property int|null $repayment_date
 * @property string $status
 * @property string|null $message
 * @property int $startup_id
 * @property int|null $investor_id
 * @property int|null $proposal_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Agreement|null $agreement
 * @property-read Investor|null $investor
 * @property-read Proposal|null $proposal
 * @property-read Startup $startup
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Transaction> $transactions
 * @property-read int|null $transactions_count
 * @method static \Illuminate\Database\Eloquent\Builder|Application newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Application newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Application query()
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereCapMultiple($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereRevenueSharePercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereFundingStage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereInvestorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereProposalId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereRepaymentCap($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereRepaymentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereRevenueSharePercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereStartupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereTotalRepaid($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Application whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Application extends Model
{
    protected $fillable = [
        'startup_id',
        'investor_id',
        'proposal_id',
        'revenue_share_percentage',
        'repayment_cap',
        'total_repaid',
        'cap_multiple',
        'message',
        'status',
        'repayment_date'
    ];

    public function startup()
    {
        return $this->belongsTo(Startup::class);
    }

    public function investor()
    {
        return $this->belongsTo(Investor::class);
    }

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function agreement()
    {
        return $this->hasOne(Agreement::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
