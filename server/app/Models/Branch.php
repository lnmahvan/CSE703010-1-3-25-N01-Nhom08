<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = [
        'code',
        'name',
        'address',
        'city',
        'phone',
        'status',
        'notes',
    ];

    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class);
    }

    public function professionalProfiles(): HasMany
    {
        return $this->hasMany(ProfessionalProfile::class);
    }
}
