<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScmInvestor extends Model
{
    protected $table = 'scm_investors';
    
    protected $fillable = ['name'];
} 