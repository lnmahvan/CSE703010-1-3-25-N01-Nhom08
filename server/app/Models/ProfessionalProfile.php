<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalProfile extends Model
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'staff_id',
        'profile_role',
        'status',
        'notes',
        'degree',
        'years_experience',
        'branch_id',
        'service_scope',
        'rejection_reason',
        'is_active',
        'submitted_at',
        'approved_at',
        'approved_by',
        'invalidated_at',
        'invalidated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'invalidated_at' => 'datetime',
        'service_scope' => 'array',
        'years_experience' => 'integer',
    ];

    protected $appends = [
        'expiring_soon',
        'has_expired_certificate',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function invalidator()
    {
        return $this->belongsTo(User::class, 'invalidated_by');
    }

    public function specialties()
    {
        return $this->hasMany(ProfessionalProfileSpecialty::class);
    }

    public function certificates()
    {
        return $this->hasMany(ProfessionalProfileCertificate::class);
    }

    public function getExpiringSoonAttribute(): bool
    {
        return $this->certificates->contains(fn ($certificate) => $certificate->is_expiring_soon);
    }

    public function getHasExpiredCertificateAttribute(): bool
    {
        return $this->certificates->contains(fn ($certificate) => $certificate->is_expired);
    }
}
