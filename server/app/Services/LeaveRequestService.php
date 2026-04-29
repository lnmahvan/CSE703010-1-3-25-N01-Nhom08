<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\Staff;
use App\Models\User;
use App\Models\WorkSchedule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeaveRequestService
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
        private readonly WorkScheduleService $workScheduleService,
    ) {
    }

    public function listRequests(array $filters): Collection
    {
        $query = LeaveRequest::with([
            'workSchedule.shiftTemplate',
            'workSchedule.branch',
            'staff',
            'reviewer',
        ]);

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['staff_id']) && $filters['staff_id'] !== 'all') {
            $query->where('staff_id', $filters['staff_id']);
        }

        return $query->orderByDesc('created_at')->limit(($filters['limit'] ?? 50))->get();
    }

    public function createForStaff(int $scheduleId, string $reason, User $actor): LeaveRequest
    {
        if (trim($reason) === '') {
            throw ValidationException::withMessages([
                'reason' => 'Vui long nhap ly do nghi phep.',
            ]);
        }

        $schedule = WorkSchedule::with('staff')->findOrFail($scheduleId);

        $staff = $this->resolveStaffForUser($actor);

        if (! $staff || $schedule->staff_id !== $staff->id) {
            throw ValidationException::withMessages([
                'work_schedule_id' => 'Ban chi co the gui yeu cau cho ca lam viec cua minh.',
            ]);
        }

        if ($schedule->isPast()) {
            throw ValidationException::withMessages([
                'work_schedule_id' => 'Ca lam viec da dien ra, khong the gui yeu cau (E6).',
            ]);
        }

        $existing = LeaveRequest::where('work_schedule_id', $scheduleId)
            ->whereIn('status', [LeaveRequest::STATUS_PENDING, LeaveRequest::STATUS_APPROVED])
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'work_schedule_id' => 'Ca nay da co yeu cau nghi phep.',
            ]);
        }

        return DB::transaction(function () use ($scheduleId, $reason, $actor, $schedule) {
            $request = LeaveRequest::create([
                'work_schedule_id' => $scheduleId,
                'staff_id' => $schedule->staff_id,
                'requested_by' => $actor->id,
                'reason' => $reason,
                'status' => LeaveRequest::STATUS_PENDING,
            ]);

            $this->auditLogService->log($actor, 'leave_request.create', [
                'leave_request_id' => $request->id,
                'schedule_id' => $scheduleId,
            ]);

            return $request->fresh(['workSchedule', 'staff']);
        });
    }

    public function approve(int $requestId, ?string $note, User $actor): LeaveRequest
    {
        return DB::transaction(function () use ($requestId, $note, $actor) {
            $request = LeaveRequest::with('workSchedule')->findOrFail($requestId);

            if ($request->status !== LeaveRequest::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'status' => 'Yeu cau khong o trang thai cho duyet.',
                ]);
            }

            $request->update([
                'status' => LeaveRequest::STATUS_APPROVED,
                'review_note' => $note,
                'reviewed_at' => now(),
                'reviewed_by' => $actor->id,
            ]);

            // Mark related schedule as cancelled with the leave reason.
            if ($request->workSchedule) {
                $request->workSchedule->update([
                    'status' => WorkSchedule::STATUS_CANCELLED,
                    'cancel_reason' => 'Nghi phep duoc duyet: '.$request->reason,
                    'cancelled_at' => now(),
                    'cancelled_by' => $actor->id,
                    'updated_by' => $actor->id,
                ]);
            }

            $this->auditLogService->log($actor, 'leave_request.approve', [
                'leave_request_id' => $request->id,
                'schedule_id' => $request->work_schedule_id,
            ]);

            return $request->fresh(['workSchedule', 'staff', 'reviewer']);
        });
    }

    public function reject(int $requestId, string $note, User $actor): LeaveRequest
    {
        // E10: rejection requires a reason
        if (trim($note) === '') {
            throw ValidationException::withMessages([
                'review_note' => 'Vui long nhap ly do tu choi (E10).',
            ]);
        }

        return DB::transaction(function () use ($requestId, $note, $actor) {
            $request = LeaveRequest::findOrFail($requestId);

            if ($request->status !== LeaveRequest::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'status' => 'Yeu cau khong o trang thai cho duyet.',
                ]);
            }

            $request->update([
                'status' => LeaveRequest::STATUS_REJECTED,
                'review_note' => $note,
                'reviewed_at' => now(),
                'reviewed_by' => $actor->id,
            ]);

            $this->auditLogService->log($actor, 'leave_request.reject', [
                'leave_request_id' => $request->id,
            ]);

            return $request->fresh(['workSchedule', 'staff', 'reviewer']);
        });
    }

    private function resolveStaffForUser(User $user): ?Staff
    {
        return Staff::where('user_id', $user->id)->first();
    }
}
