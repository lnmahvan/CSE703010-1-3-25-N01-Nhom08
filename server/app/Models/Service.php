<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_HIDDEN = 'hidden';
    public const STATUS_DISCONTINUED = 'discontinued';

    public const VISIBILITY_PUBLIC = 'public';
    public const VISIBILITY_INTERNAL = 'internal';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_ACTIVE,
        self::STATUS_HIDDEN,
        self::STATUS_DISCONTINUED,
    ];

    public const VISIBILITIES = [
        self::VISIBILITY_PUBLIC,
        self::VISIBILITY_INTERNAL,
    ];

    protected $fillable = [
        'service_code',
        'service_group_id',
        'name',
        'description',
        'price',
        'duration_minutes',
        'commission_rate',
        'status',
        'visibility',
        'notes',
        'image_path',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_minutes' => 'integer',
        'commission_rate' => 'integer',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ServiceGroup::class, 'service_group_id');
    }

    public function specialties(): BelongsToMany
    {
        return $this->belongsToMany(Specialty::class, 'service_specialty')
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function primarySpecialty()
    {
        return $this->specialties()->wherePivot('is_primary', true)->first();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ServiceAttachment::class);
    }

    public function priceHistory(): HasMany
    {
        return $this->hasMany(ServicePriceHistory::class)->orderByDesc('created_at');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ServiceStatusHistory::class)->orderByDesc('created_at');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
