<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $fillable = [
        'employee_code',
        'full_name',
        'phone',
        'email',
        'avatar',
        'join_date',
        'status',
        'role_slug',
        'branch_id',
        'certificate_file',
        'is_certificate_valid',
        'user_id',
        // Field mở rộng - thông tin cá nhân
        'birthday',
        'gender',
        'id_card',
        'id_card_verified',
        'nationality',
        // Field mở rộng - chuyên môn & đãi ngộ
        'highest_degree',
        'major',
        'school',
        'graduation_year',
        'practice_certificate',
        'base_salary',
        'salary_type',
        'bank_name',
        'bank_account',
        'tax_code',
    ];

    protected $casts = [
        'join_date' => 'date',
        'birthday' => 'date',
        'is_certificate_valid' => 'boolean',
        'id_card_verified' => 'boolean',
        'graduation_year' => 'integer',
        'base_salary' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function professionalProfiles()
    {
        return $this->hasMany(ProfessionalProfile::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
