<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * App\Models\Proposal
 *
 * @mixin IdeHelperProposal
 * @property int $id
 * @property string $title
 * @property string $company_name
 * @property string|null $company_industry
 * @property string|null $contact_person
 * @property string|null $contact_email
 * @property string|null $contact_phone
 * @property string|null $business_model
 * @property string|null $target_market
 * @property string|null $unique_value_proposition
 * @property string|null $competitive_advantage
 * @property string|null $business_goals
 * @property string|null $market_size
 * @property string|null $market_growth_rate
 * @property string|null $market_trends
 * @property string|null $competition_analysis
 * @property string|null $customer_segments
 * @property string $funding_amount
 * @property string $funding_stage
 * @property string $funding_purpose
 * @property string|null $current_revenue
 * @property string|null $projected_revenue_12m
 * @property string|null $projected_revenue_24m
 * @property string|null $current_profit_margin
 * @property string|null $projected_profit_margin
 * @property string|null $break_even_point
 * @property string|null $cash_flow_analysis
 * @property string $status
 * @property int $startup_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Application> $applications
 * @property-read int|null $applications_count
 * @property-read \App\Models\Startup $startup
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal query()
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereBreakEvenPoint($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereBusinessGoals($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereBusinessModel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCashFlowAnalysis($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCompanyIndustry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCompetitionAnalysis($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCompetitiveAdvantage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereContactEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereContactPerson($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereContactPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCurrentProfitMargin($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCurrentRevenue($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereCustomerSegments($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereFundingAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereFundingPurpose($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereFundingStage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereMarketGrowthRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereMarketSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereMarketTrends($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereProjectedProfitMargin($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereProjectedRevenue12m($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereProjectedRevenue24m($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereStartupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereTargetMarket($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereUniqueValueProposition($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proposal whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        // Company Overview
        'title',
        'company_name',
        'company_industry',
        'contact_person',
        'contact_email',
        'contact_phone',
        'business_model',
        'target_market',
        'unique_value_proposition',
        'competitive_advantage',
        'business_goals',
        'market_size',
        'market_growth_rate',
        'market_trends',
        'competition_analysis',
        'customer_segments',

        // Funding Requirements
        'funding_amount',
        'funding_stage',
        'funding_purpose',

        // Financial Projections
        'current_revenue',
        'projected_revenue_12m',
        'projected_revenue_24m',
        'current_profit_margin',
        'projected_profit_margin',
        'break_even_point',
        'cash_flow_analysis',

        // System fields
        'status',
        'startup_id'
    ];

    protected $casts = [
        'funding_amount' => 'decimal:2',
        'current_revenue' => 'decimal:2',
        'projected_revenue_12m' => 'decimal:2',
        'projected_revenue_24m' => 'decimal:2',
        'current_profit_margin' => 'decimal:2',
        'projected_profit_margin' => 'decimal:2',
    ];

    public function startup(): BelongsTo
    {
        return $this->belongsTo(Startup::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function isReviewed(): bool
    {
        return $this->status === 'REVIEWED';
    }

    public function isDraft(): bool
    {
        return $this->status === 'DRAFT';
    }

    public static function getStatusOptions(): array
    {
        return [
            'DRAFT' => 'Draft',
            'REVIEWED' => 'Reviewed'
        ];
    }
}
