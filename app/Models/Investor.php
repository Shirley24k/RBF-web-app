<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
