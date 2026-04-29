<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\ProfessionalProfile;
use App\Models\Staff;
use App\Models\User;
use App\Models\WorkSchedule;
use App\Models\WorkShiftTemplate;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon as SupportCarbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkScheduleService
{
    public const MAX_HOURS_PER_DAY = 12;
    public const MAX_HOURS_PER_WEEK = 60;
    public const MIN_STAFF_PER_BRANCH_PER_DAY = 1;

    public const DOCTOR_WORK_ROLES = [
        'doctor_treatment',
        'doctor_consult',
        'doctor_surgery',
    ];

    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {
    }

    public function listSchedules(array $filters): array
    {
        $from = ! empty($filters['from'])
            ? Carbon::parse($filters['from'])->toDateString()
            : Carbon::now()->startOfWeek()->toDateString();
        $to = ! empty($filters['to'])
            ? Carbon::parse($filters['to'])->toDateString()
            : Carbon::now()->endOfWeek()->toDateString();

        $query = WorkSchedule::query()
            ->with([
                'staff',
                'staff.user',
                'staff.branch',
                'branch',
                'shiftTemplate',
                'creator',
                'updater',
            ])
            ->whereBetween('work_date', [$from, $to]);

        if (! empty($filters['branch_id']) && $filters['branch_id'] !== 'all') {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (! empty($filters['staff_id']) && $filters['staff_id'] !== 'all') {
            $query->where('staff_id', $filters['staff_id']);
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['role']) && $filters['role'] !== 'all') {
            $query->whereHas('staff', fn ($q) => $q->where('role_slug', $filters['role']));
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas(
                'staff',
                fn ($q) => $q
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%")
            );
        }

        $schedules = $query->orderBy('work_date')->orderBy('start_time')->get();

        return [
            'from' => $from,
            'to' => $to,
            'data' => $schedules,
        ];
    }

    public function getSchedule(int $id): WorkSchedule
    {
        return WorkSchedule::with([
            'staff.user',
            'staff.branch',
            'branch',
            'shiftTemplate',
            'creator',
            'updater',
            'canceller',
        ])->findOrFail($id);
    }

    public function createSchedule(array $data, User $actor): WorkSchedule
    {
        return DB::transaction(function () use ($data, $actor) {
            $payload = $this->buildSchedulePayload($data);
            $this->validateForStaff($payload['staff_id'], $payload, null);

            $schedule = WorkSchedule::create(array_merge($payload, [
                'status' => $data['status'] ?? WorkSchedule::STATUS_SCHEDULED,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]));

            $this->auditLogService->log($actor, 'schedule.create', [
                'schedule_id' => $schedule->id,
                'staff_id' => $schedule->staff_id,
                'work_date' => $schedule->work_date->toDateString(),
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
            ]);

            return $schedule->fresh(['staff', 'branch', 'shiftTemplate']);
        });
    }

    public function updateSchedule(int $id, array $data, User $actor): WorkSchedule
    {
        return DB::transaction(function () use ($id, $data, $actor) {
            $schedule = WorkSchedule::findOrFail($id);

            // E6: cannot edit past schedules
            if ($schedule->isPast()) {
                throw ValidationException::withMessages([
                    'work_date' => 'Khong the chinh sua lich da dien ra (E6).',
                ]);
            }

            $payload = $this->buildSchedulePayload(array_merge(
                [
                    'staff_id' => $schedule->staff_id,
                    'branch_id' => $schedule->branch_id,
                    'shift_template_id' => $schedule->shift_template_id,
                    'work_date' => $schedule->work_date->toDateString(),
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'work_role' => $schedule->work_role,
                    'room' => $schedule->room,
                    'notes' => $schedule->notes,
                ],
                $data
            ));

            $this->validateForStaff($payload['staff_id'], $payload, $schedule->id);

            $schedule->update(array_merge($payload, [
                'status' => $data['status'] ?? $schedule->status,
                'updated_by' => $actor->id,
            ]));

            $this->auditLogService->log($actor, 'schedule.update', [
                'schedule_id' => $schedule->id,
                'staff_id' => $schedule->staff_id,
                'work_date' => $schedule->work_date->toDateString(),
            ]);

            return $schedule->fresh(['staff', 'branch', 'shiftTemplate']);
        });
    }

    public function cancelSchedule(int $id, string $reason, User $actor): WorkSchedule
    {
        if (trim($reason) === '') {
            throw ValidationException::withMessages([
                'cancel_reason' => 'Vui long nhap ly do huy lich.',
            ]);
        }

        return DB::transaction(function () use ($id, $reason, $actor) {
            $schedule = WorkSchedule::findOrFail($id);

            if ($schedule->status === WorkSchedule::STATUS_CANCELLED) {
                throw ValidationException::withMessages([
                    'status' => 'Lich da bi huy truoc do.',
                ]);
            }

            // E6: cannot cancel past schedules
            if ($schedule->isPast()) {
                throw ValidationException::withMessages([
                    'work_date' => 'Khong the huy lich da dien ra (E6).',
                ]);
            }

            // E7: has appointments? Placeholder hook - throws if implementation exists.
            if ($this->hasRelatedAppointments($schedule)) {
                throw ValidationException::withMessages([
                    'related' => 'Lich da co lich kham/benh nhan dat lich, vui long xu ly truoc khi huy (E7).',
                ]);
            }

            $schedule->update([
                'status' => WorkSchedule::STATUS_CANCELLED,
                'cancel_reason' => $reason,
                'cancelled_at' => now(),
                'cancelled_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            // E8: warn (do not block) if branch goes below min staff
            $belowMin = $this->branchBelowMinStaff(
                $schedule->branch_id,
                $schedule->work_date->toDateString()
            );

            $this->auditLogService->log($actor, 'schedule.cancel', [
                'schedule_id' => $schedule->id,
                'staff_id' => $schedule->staff_id,
                'reason' => $reason,
                'branch_below_min' => $belowMin,
            ]);

            return $schedule->fresh(['staff', 'branch', 'shiftTemplate']);
        });
    }

    /**
     * Copy schedules from a source week (Mon-Sun) to a destination week.
     */
    public function copyWeek(string $sourceFrom, string $destFrom, User $actor, bool $skipConflicts = true): array
    {
        $sourceStart = Carbon::parse($sourceFrom)->startOfDay();
        $sourceEnd = (clone $sourceStart)->addDays(6)->endOfDay();
        $destStart = Carbon::parse($destFrom)->startOfDay();
        $offsetDays = $sourceStart->diffInDays($destStart, false);

        $sources = WorkSchedule::whereBetween('work_date', [$sourceStart->toDateString(), $sourceEnd->toDateString()])
            ->whereIn('status', WorkSchedule::ACTIVE_STATUSES)
            ->get();

        $created = 0;
        $skipped = 0;
        $conflicts = [];

        DB::transaction(function () use ($sources, $offsetDays, $actor, $skipConflicts, &$created, &$skipped, &$conflicts) {
            foreach ($sources as $source) {
                $newDate = (clone $source->work_date)->addDays($offsetDays)->toDateString();
                $payload = [
                    'staff_id' => $source->staff_id,
                    'branch_id' => $source->branch_id,
                    'shift_template_id' => $source->shift_template_id,
                    'work_date' => $newDate,
                    'start_time' => $source->start_time,
                    'end_time' => $source->end_time,
                    'work_role' => $source->work_role,
                    'room' => $source->room,
                    'notes' => $source->notes,
                ];

                try {
                    $this->validateForStaff($source->staff_id, $payload, null);
                } catch (ValidationException $e) {
                    if ($skipConflicts) {
                        $skipped++;
                        $conflicts[] = [
                            'staff_id' => $source->staff_id,
                            'work_date' => $newDate,
                            'errors' => $e->errors(),
                        ];

                        continue;
                    }

                    throw $e;
                }

                WorkSchedule::create(array_merge($payload, [
                    'status' => WorkSchedule::STATUS_SCHEDULED,
                    'created_by' => $actor->id,
                    'updated_by' => $actor->id,
                ]));
                $created++;
            }
        });

        $this->auditLogService->log($actor, 'schedule.copy_week', [
            'source_from' => $sourceStart->toDateString(),
            'dest_from' => $destStart->toDateString(),
            'created' => $created,
            'skipped' => $skipped,
        ]);

        return [
            'created' => $created,
            'skipped' => $skipped,
            'conflicts' => $conflicts,
        ];
    }

    public function branchStats(string $from, string $to): array
    {
        $branches = Branch::orderBy('name')->get();
        $stats = [];

        foreach ($branches as $branch) {
            $totalStaff = $branch->staff()->count();
            $assigned = WorkSchedule::where('branch_id', $branch->id)
                ->whereBetween('work_date', [$from, $to])
                ->whereIn('status', WorkSchedule::ACTIVE_STATUSES)
                ->distinct('staff_id')
                ->count('staff_id');
            $suspended = $branch->staff()->where('status', 'suspended')->count();
            $resigned = $branch->staff()->where('status', 'resigned')->count();
            $belowMin = max(0, self::MIN_STAFF_PER_BRANCH_PER_DAY - $assigned);

            $stats[] = [
                'branch_id' => $branch->id,
                'branch_name' => $branch->name,
                'total_staff' => $totalStaff,
                'assigned' => $assigned,
                'below_min' => $belowMin,
                'suspended' => $suspended,
                'resigned' => $resigned,
            ];
        }

        return $stats;
    }

    public function listAuditLogs(int $limit = 30): Collection
    {
        return AuditLog::query()
            ->where('action', 'like', 'schedule.%')
            ->orWhere('action', 'like', 'leave_request.%')
            ->orWhere('action', 'like', 'shift_swap.%')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function getSchedulesForStaff(int $staffId, ?string $from = null, ?string $to = null): Collection
    {
        $from = $from ?: Carbon::now()->startOfWeek()->toDateString();
        $to = $to ?: Carbon::now()->endOfWeek()->toDateString();

        return WorkSchedule::with(['branch', 'shiftTemplate'])
            ->where('staff_id', $staffId)
            ->whereBetween('work_date', [$from, $to])
            ->orderBy('work_date')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Build a normalized payload from request data.
     */
    private function buildSchedulePayload(array $data): array
    {
        $template = null;
        if (! empty($data['shift_template_id'])) {
            $template = WorkShiftTemplate::find($data['shift_template_id']);
        }

        $startTime = $data['start_time'] ?? $template?->start_time;
        $endTime = $data['end_time'] ?? $template?->end_time;

        if (! $startTime || ! $endTime) {
            throw ValidationException::withMessages([
                'start_time' => 'Vui long chon ca chuan hoac nhap gio bat dau/ket thuc.',
            ]);
        }

        $startTime = $this->normalizeTime($startTime);
        $endTime = $this->normalizeTime($endTime);

        if (strtotime($endTime) <= strtotime($startTime)) {
            throw ValidationException::withMessages([
                'end_time' => 'Gio ket thuc phai sau gio bat dau.',
            ]);
        }

        return [
            'staff_id' => (int) $data['staff_id'],
            'branch_id' => $data['branch_id'] ?? null,
            'shift_template_id' => $data['shift_template_id'] ?? null,
            'work_date' => Carbon::parse($data['work_date'])->toDateString(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'work_role' => $data['work_role'],
            'room' => $data['room'] ?? null,
            'notes' => $data['notes'] ?? null,
        ];
    }

    /**
     * Run E1-E5 validations for a (potentially new) schedule for a staff.
     */
    public function validateForStaff(int $staffId, array $payload, ?int $excludeScheduleId): void
    {
        $staff = Staff::with('user')->findOrFail($staffId);

        // E2: staff must be working
        if ($staff->status !== 'working') {
            throw ValidationException::withMessages([
                'staff_id' => 'Nhan su dang Tam nghi hoac Nghi viec, khong the phan cong (E2).',
            ]);
        }

        // E3 + E4: doctor must have approved & active professional profile, work role compatible
        if ($staff->role_slug === 'bac_si') {
            $profile = ProfessionalProfile::where('staff_id', $staff->id)
                ->where('profile_role', 'bac_si')
                ->first();

            if (! $profile || $profile->status !== ProfessionalProfile::STATUS_APPROVED || ! $profile->is_active) {
                throw ValidationException::withMessages([
                    'staff_id' => 'Bac si chua co ho so chuyen mon hop le (Hoan thien/Cho duyet/Het han) (E3).',
                ]);
            }

            if (! in_array($payload['work_role'], self::DOCTOR_WORK_ROLES, true)) {
                throw ValidationException::withMessages([
                    'work_role' => 'Vai tro cong viec khong phu hop voi chuyen mon bac si (E4).',
                ]);
            }
        } elseif (in_array($payload['work_role'], self::DOCTOR_WORK_ROLES, true)) {
            // E4 (reverse): non-doctors cannot hold doctor-specific work roles
            throw ValidationException::withMessages([
                'work_role' => 'Vai tro cong viec danh rieng cho bac si, khong the gan cho nhan su nay (E4).',
            ]);
        }

        // E1: overlap on same day
        $overlapping = WorkSchedule::where('staff_id', $staffId)
            ->where('work_date', $payload['work_date'])
            ->whereIn('status', WorkSchedule::ACTIVE_STATUSES)
            ->when($excludeScheduleId, fn ($q) => $q->where('id', '!=', $excludeScheduleId))
            ->where(function ($q) use ($payload) {
                $q->where(function ($qq) use ($payload) {
                    $qq->where('start_time', '<', $payload['end_time'])
                        ->where('end_time', '>', $payload['start_time']);
                });
            })
            ->exists();

        if ($overlapping) {
            throw ValidationException::withMessages([
                'start_time' => 'Nhan su da co lich trung thoi gian trong ngay nay (E1).',
            ]);
        }

        // E5: max hours per day / per week
        $newHours = $this->hours($payload['start_time'], $payload['end_time']);

        $sameDay = WorkSchedule::where('staff_id', $staffId)
            ->where('work_date', $payload['work_date'])
            ->whereIn('status', WorkSchedule::ACTIVE_STATUSES)
            ->when($excludeScheduleId, fn ($q) => $q->where('id', '!=', $excludeScheduleId))
            ->get();

        $dayHours = $sameDay->sum(fn ($s) => $this->hours($s->start_time, $s->end_time)) + $newHours;
        if ($dayHours > self::MAX_HOURS_PER_DAY) {
            throw ValidationException::withMessages([
                'work_date' => 'Vuot qua so gio lam toi da '.self::MAX_HOURS_PER_DAY.'h/ngay (E5).',
            ]);
        }

        $weekStart = Carbon::parse($payload['work_date'])->startOfWeek()->toDateString();
        $weekEnd = Carbon::parse($payload['work_date'])->endOfWeek()->toDateString();

        $sameWeek = WorkSchedule::where('staff_id', $staffId)
            ->whereBetween('work_date', [$weekStart, $weekEnd])
            ->whereIn('status', WorkSchedule::ACTIVE_STATUSES)
            ->when($excludeScheduleId, fn ($q) => $q->where('id', '!=', $excludeScheduleId))
            ->get();

        $weekHours = $sameWeek->sum(fn ($s) => $this->hours($s->start_time, $s->end_time)) + $newHours;
        if ($weekHours > self::MAX_HOURS_PER_WEEK) {
            throw ValidationException::withMessages([
                'work_date' => 'Vuot qua so gio lam toi da '.self::MAX_HOURS_PER_WEEK.'h/tuan (E5).',
            ]);
        }
    }

    public function branchBelowMinStaff(?int $branchId, string $date): bool
    {
        if (! $branchId) {
            return false;
        }

        $assigned = WorkSchedule::where('branch_id', $branchId)
            ->where('work_date', $date)
            ->whereIn('status', WorkSchedule::ACTIVE_STATUSES)
            ->distinct('staff_id')
            ->count('staff_id');

        return $assigned < self::MIN_STAFF_PER_BRANCH_PER_DAY;
    }

    /**
     * Hook to integrate with future appointments module. Returns true if the
     * schedule has linked appointments that block cancellation/edition.
     */
    public function hasRelatedAppointments(WorkSchedule $schedule): bool
    {
        // Appointments module is not implemented yet. Once it exists, this
        // method should query appointments where schedule_id = $schedule->id
        // and status in [scheduled, confirmed, in_progress].
        return false;
    }

    private function normalizeTime(string $time): string
    {
        // Accept "07:00" or "07:00:00".
        if (preg_match('/^\d{2}:\d{2}$/', $time)) {
            return $time.':00';
        }

        return $time;
    }

    private function hours(string $start, string $end): float
    {
        $startTs = strtotime($start);
        $endTs = strtotime($end);
        if ($startTs === false || $endTs === false) {
            return 0;
        }

        return max(0, ($endTs - $startTs) / 3600);
    }
}
