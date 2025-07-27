<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    protected $fillable = [
        'amount',
        'type',
        'transaction_datetime',
        'from_stripe_id',
        'to_stripe_id',
        'status',
        'application_id'
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
