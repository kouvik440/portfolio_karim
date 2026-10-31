<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioEntry extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['technologies' => 'array', 'is_published' => 'boolean', 'sort_order' => 'integer'];
    }
}
