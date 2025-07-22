<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'startup_id',
        'investor_id',
        'proposal_path',
        'funding_amount',
        'funding_stage',
        'funding_purpose',
        'message',
        'status'
    ];

    public function startup()
    {
        return $this->belongsTo(Startup::class);
    }

    public function investor()
    {
        return $this->belongsTo(Investor::class);
    }

    public function agreement()
    {
        return $this->hasOne(Agreement::class);
    }
} 