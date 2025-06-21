<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Startup extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'contact_no',
        'company_name',
        'company_sector',
        'company_address',
        'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
