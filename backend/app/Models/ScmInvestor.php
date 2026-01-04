<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\ScmInvestor
 *
 * @mixin IdeHelperScmInvestor
 * @method static \Illuminate\Database\Eloquent\Builder|ScmInvestor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ScmInvestor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ScmInvestor query()
 * @mixin \Eloquent
 */
class ScmInvestor extends Model
{
    protected $table = 'scm_investors';
    
    protected $fillable = ['name'];
} 