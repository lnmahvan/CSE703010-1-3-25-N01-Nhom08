<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_SWAPPED = 'swapped';

    public const ACTIVE_STATUSES = [
        self::STATUS_SCHEDULED,
        self::STATUS_CONFIRMED,
    ];

    protected $fillable = [
        'staff_id',
        'branch_id',
        'shift_template_id',
        'work_date',
        'start_time',
        'end_time',
        'work_role',
        'room',
        'notes',
        'status',
        'cancel_reason',
        'cancelled_at',
        'cancelled_by',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'work_date' => 'date',
        'cancelled_at' => 'datetime',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function shiftTemplate()
    {
        return $this->belongsTo(WorkShiftTemplate::class, 'shift_template_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function canceller()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function swapRequests()
    {
        return $this->hasMany(ShiftSwapRequest::class, 'requester_schedule_id');
    }

    public function isActive(): bool
    {
        return in_array($this->status, self::ACTIVE_STATUSES, true);
    }

    public function durationHours(): float
    {
        $start = strtotime($this->start_time);
        $end = strtotime($this->end_time);
        if ($start === false || $end === false) {
            return 0;
        }

        return round(max(0, ($end - $start) / 3600), 2);
    }

    public function isPast(): bool
    {
        $endAt = strtotime($this->work_date->toDateString().' '.$this->end_time);

        return $endAt !== false && $endAt < time();
    }
}
