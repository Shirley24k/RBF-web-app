<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProposalReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'section_type',
        'comments',
        'is_resolved',
    ];

    protected $casts = [
        'comments' => 'array',
        'is_resolved' => 'boolean',
    ];

    /**
     * Get the proposal that owns the review.
     */
    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    /**
     * Scope to get reviews by section type.
     */
    public function scopeBySection($query, string $sectionType)
    {
        return $query->where('section_type', $sectionType);
    }

    /**
     * Scope to get resolved reviews.
     */
    public function scopeResolved($query)
    {
        return $query->where('is_resolved', true);
    }

    /**
     * Scope to get unresolved reviews.
     */
    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }
}
