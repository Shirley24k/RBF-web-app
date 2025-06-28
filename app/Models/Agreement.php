<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
