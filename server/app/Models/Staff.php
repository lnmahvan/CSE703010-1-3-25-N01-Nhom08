<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $fillable = [
        'employee_code',
        'full_name',
        'birthday',
        'gender',
        'id_card',
        'id_card_verified',
        'nationality',
        'phone',
        'email',
        'avatar',
        'join_date',
        'status',
        'role_slug',
        'certificate_file',
        'is_certificate_valid',
        'user_id'
    ];

    protected $casts = [
        'join_date' => 'date',
        'birthday' => 'date',
        'is_certificate_valid' => 'boolean',
        'id_card_verified' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function professionalProfiles()
    {
        return $this->hasMany(ProfessionalProfile::class);
    }
}
