<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkShiftTemplate;
use App\Services\WorkScheduleService;
use Illuminate\Http\Request;

class WorkScheduleController extends Controller
{
    public function __construct(private readonly WorkScheduleService $service)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'branch_id' => 'nullable',
            'staff_id' => 'nullable',
            'status' => 'nullable|string',
            'role' => 'nullable|string',
            'search' => 'nullable|string|max:255',
        ]);

        return response()->json($this->service->listSchedules($filters));
    }

    public function show(int $id)
    {
        return response()->json($this->service->getSchedule($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->scheduleRules());

        return response()->json(
            $this->service->createSchedule($data, $request->user()),
            201
        );
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate($this->scheduleRules(updating: true));

        return response()->json(
            $this->service->updateSchedule($id, $data, $request->user())
        );
    }

    public function destroy(Request $request, int $id)
    {
        $data = $request->validate([
            'cancel_reason' => 'required|string|min:3|max:500',
        ]);

        return response()->json(
            $this->service->cancelSchedule($id, $data['cancel_reason'], $request->user())
        );
    }

    public function copy(Request $request)
    {
        $data = $request->validate([
            'source_from' => 'required|date',
            'dest_from' => 'required|date',
            'skip_conflicts' => 'nullable|boolean',
        ]);

        return response()->json($this->service->copyWeek(
            $data['source_from'],
            $data['dest_from'],
            $request->user(),
            $data['skip_conflicts'] ?? true,
        ));
    }

    public function templates()
    {
        return response()->json(
            WorkShiftTemplate::orderBy('display_order')->get()
        );
    }

    public function branchStats(Request $request)
    {
        $data = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        return response()->json($this->service->branchStats($data['from'], $data['to']));
    }

    public function auditLogs(Request $request)
    {
        $data = $request->validate([
            'limit' => 'nullable|integer|min:1|max:200',
        ]);

        return response()->json($this->service->listAuditLogs($data['limit'] ?? 30));
    }

    private function scheduleRules(bool $updating = false): array
    {
        $required = $updating ? 'sometimes|required' : 'required';

        return [
            'staff_id' => "{$required}|integer|exists:staff,id",
            'branch_id' => 'nullable|integer|exists:branches,id',
            'shift_template_id' => 'nullable|integer|exists:work_shift_templates,id',
            'work_date' => "{$required}|date",
            'start_time' => 'nullable|date_format:H:i,H:i:s',
            'end_time' => 'nullable|date_format:H:i,H:i:s',
            'work_role' => "{$required}|string|max:64",
            'room' => 'nullable|string|max:120',
            'notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:scheduled,confirmed,cancelled,completed,swapped',
        ];
    }
}
