<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalProfileSpecialty extends Model
{
    protected $fillable = [
        'professional_profile_id',
        'specialty_name',
        'degree',
        'years_experience',
        'service_scope',
        'branch_or_room',
        'notes',
    ];

    protected $casts = [
        'service_scope' => 'array',
    ];

    public function profile()
    {
        return $this->belongsTo(ProfessionalProfile::class, 'professional_profile_id');
    }

    public function certificates()
    {
        return $this->hasMany(ProfessionalProfileCertificate::class, 'professional_profile_specialty_id');
    }
}
