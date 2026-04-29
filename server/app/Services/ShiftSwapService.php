<?php

namespace App\Services;

use App\Models\ShiftSwapRequest;
use App\Models\Staff;
use App\Models\User;
use App\Models\WorkSchedule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShiftSwapService
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
        private readonly WorkScheduleService $workScheduleService,
    ) {
    }

    public function listRequests(array $filters): Collection
    {
        $query = ShiftSwapRequest::with([
            'requesterSchedule.shiftTemplate',
            'targetSchedule.shiftTemplate',
            'requesterStaff',
            'targetStaff',
            'reviewer',
        ]);

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('created_at')->limit(($filters['limit'] ?? 50))->get();
    }

    public function createForStaff(array $data, User $actor): ShiftSwapRequest
    {
        $schedule = WorkSchedule::findOrFail($data['requester_schedule_id']);
        $targetStaff = Staff::findOrFail($data['target_staff_id']);

        $requesterStaff = Staff::where('user_id', $actor->id)->first();

        if (! $requesterStaff || $schedule->staff_id !== $requesterStaff->id) {
            throw ValidationException::withMessages([
                'requester_schedule_id' => 'Ban chi co the gui yeu cau doi ca cho ca cua minh.',
            ]);
        }

        if ($schedule->isPast()) {
            throw ValidationException::withMessages([
                'requester_schedule_id' => 'Ca lam viec da dien ra (E6).',
            ]);
        }

        if ($targetStaff->id === $requesterStaff->id) {
            throw ValidationException::withMessages([
                'target_staff_id' => 'Khong the doi ca voi chinh minh.',
            ]);
        }

        if ($targetStaff->status !== 'working') {
            throw ValidationException::withMessages([
                'target_staff_id' => 'Nhan su muc tieu khong o trang thai Dang lam viec (E2).',
            ]);
        }

        // E9: target must satisfy schedule constraints (specialty + availability).
        $payload = [
            'staff_id' => $targetStaff->id,
            'branch_id' => $schedule->branch_id,
            'shift_template_id' => $schedule->shift_template_id,
            'work_date' => $schedule->work_date->toDateString(),
            'start_time' => $schedule->start_time,
            'end_time' => $schedule->end_time,
            'work_role' => $schedule->work_role,
            'room' => $schedule->room,
        ];
        try {
            $this->workScheduleService->validateForStaff($targetStaff->id, $payload, null);
        } catch (ValidationException $e) {
            throw ValidationException::withMessages([
                'target_staff_id' => 'Nhan su muc tieu khong du dieu kien doi ca: '
                    .implode(' | ', array_map(
                        fn ($messages) => is_array($messages) ? implode(',', $messages) : (string) $messages,
                        $e->errors()
                    ))
                    .' (E9).',
            ]);
        }

        return DB::transaction(function () use ($schedule, $targetStaff, $data, $actor, $requesterStaff) {
            $request = ShiftSwapRequest::create([
                'requester_schedule_id' => $schedule->id,
                'requester_staff_id' => $requesterStaff->id,
                'target_staff_id' => $targetStaff->id,
                'target_schedule_id' => $data['target_schedule_id'] ?? null,
                'requested_by' => $actor->id,
                'reason' => $data['reason'] ?? null,
                'status' => ShiftSwapRequest::STATUS_PENDING,
            ]);

            $this->auditLogService->log($actor, 'shift_swap.create', [
                'request_id' => $request->id,
                'schedule_id' => $schedule->id,
                'target_staff_id' => $targetStaff->id,
            ]);

            return $request->fresh(['requesterStaff', 'targetStaff', 'requesterSchedule']);
        });
    }

    public function approve(int $requestId, ?string $note, User $actor): ShiftSwapRequest
    {
        return DB::transaction(function () use ($requestId, $note, $actor) {
            $request = ShiftSwapRequest::with(['requesterSchedule', 'targetSchedule'])->findOrFail($requestId);

            if ($request->status !== ShiftSwapRequest::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'status' => 'Yeu cau khong o trang thai cho duyet.',
                ]);
            }

            $requesterSchedule = $request->requesterSchedule;
            $targetSchedule = $request->targetSchedule;

            // Re-check target staff availability at approval time (no long-running locks here).
            $payload = [
                'staff_id' => $request->target_staff_id,
                'branch_id' => $requesterSchedule->branch_id,
                'shift_template_id' => $requesterSchedule->shift_template_id,
                'work_date' => $requesterSchedule->work_date->toDateString(),
                'start_time' => $requesterSchedule->start_time,
                'end_time' => $requesterSchedule->end_time,
                'work_role' => $requesterSchedule->work_role,
            ];
            $this->workScheduleService->validateForStaff(
                $request->target_staff_id,
                $payload,
                $targetSchedule?->id
            );

            // Swap assignment: requester schedule -> target staff
            $requesterSchedule->update([
                'staff_id' => $request->target_staff_id,
                'status' => WorkSchedule::STATUS_CONFIRMED,
                'updated_by' => $actor->id,
            ]);

            // If target had a schedule, give it to requester
            if ($targetSchedule) {
                $targetSchedule->update([
                    'staff_id' => $request->requester_staff_id,
                    'status' => WorkSchedule::STATUS_CONFIRMED,
                    'updated_by' => $actor->id,
                ]);
            }

            $request->update([
                'status' => ShiftSwapRequest::STATUS_APPROVED,
                'review_note' => $note,
                'reviewed_at' => now(),
                'reviewed_by' => $actor->id,
            ]);

            $this->auditLogService->log($actor, 'shift_swap.approve', [
                'request_id' => $request->id,
            ]);

            return $request->fresh(['requesterSchedule', 'targetSchedule', 'reviewer']);
        });
    }

    public function reject(int $requestId, string $note, User $actor): ShiftSwapRequest
    {
        if (trim($note) === '') {
            throw ValidationException::withMessages([
                'review_note' => 'Vui long nhap ly do tu choi (E10).',
            ]);
        }

        return DB::transaction(function () use ($requestId, $note, $actor) {
            $request = ShiftSwapRequest::findOrFail($requestId);

            if ($request->status !== ShiftSwapRequest::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'status' => 'Yeu cau khong o trang thai cho duyet.',
                ]);
            }

            $request->update([
                'status' => ShiftSwapRequest::STATUS_REJECTED,
                'review_note' => $note,
                'reviewed_at' => now(),
                'reviewed_by' => $actor->id,
            ]);

            $this->auditLogService->log($actor, 'shift_swap.reject', [
                'request_id' => $request->id,
            ]);

            return $request->fresh();
        });
    }
}
