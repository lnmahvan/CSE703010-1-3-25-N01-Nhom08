<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShiftSwapRequest extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'requester_schedule_id',
        'requester_staff_id',
        'target_staff_id',
        'target_schedule_id',
        'requested_by',
        'reason',
        'status',
        'review_note',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function requesterSchedule()
    {
        return $this->belongsTo(WorkSchedule::class, 'requester_schedule_id');
    }

    public function targetSchedule()
    {
        return $this->belongsTo(WorkSchedule::class, 'target_schedule_id');
    }

    public function requesterStaff()
    {
        return $this->belongsTo(Staff::class, 'requester_staff_id');
    }

    public function targetStaff()
    {
        return $this->belongsTo(Staff::class, 'target_staff_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
