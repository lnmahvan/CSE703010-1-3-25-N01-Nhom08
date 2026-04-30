<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceAttachment extends Model
{
    public const TYPE_IMAGE = 'image';
    public const TYPE_DOCUMENT = 'document';

    public const VISIBILITY_PUBLIC = 'public';
    public const VISIBILITY_INTERNAL = 'internal';

    protected $fillable = [
        'service_id',
        'attachment_type',
        'visibility',
        'file_path',
        'file_name',
        'file_mime',
        'file_size',
        'description',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Internal storage path is never returned in API responses.
     */
    protected $hidden = [
        'file_path',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
