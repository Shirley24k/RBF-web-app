<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Investor;
use App\Models\Startup;

class Application extends Model
{
    protected $fillable = [
        'startup_id',
        'investor_id',
        'proposal_path',
        'funding_amount',
        'funding_stage',
        'funding_purpose',
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

    public function agreement()
    {
        return $this->hasOne(Agreement::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

} 