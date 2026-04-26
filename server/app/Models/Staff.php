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
        'certificate_file',
        'is_certificate_valid',
        'user_id'
    ];

    protected $casts = [
        'join_date' => 'date',
        'is_certificate_valid' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
