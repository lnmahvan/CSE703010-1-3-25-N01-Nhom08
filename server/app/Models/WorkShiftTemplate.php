<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkShiftTemplate extends Model
{
    public const CODE_MORNING = 'morning';
    public const CODE_AFTERNOON = 'afternoon';
    public const CODE_EVENING = 'evening';
    public const CODE_CUSTOM = 'custom';

    protected $fillable = [
        'code',
        'name',
        'start_time',
        'end_time',
        'color',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function schedules()
    {
        return $this->hasMany(WorkSchedule::class, 'shift_template_id');
    }
}
