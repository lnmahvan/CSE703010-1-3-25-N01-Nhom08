<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ShiftSwapService;
use Illuminate\Http\Request;

class ShiftSwapRequestController extends Controller
{
    public function __construct(private readonly ShiftSwapService $service)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:200',
        ]);

        return response()->json($this->service->listRequests($filters));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'requester_schedule_id' => 'required|integer|exists:work_schedules,id',
            'target_staff_id' => 'required|integer|exists:staff,id',
            'target_schedule_id' => 'nullable|integer|exists:work_schedules,id',
            'reason' => 'nullable|string|max:500',
        ]);

        return response()->json(
            $this->service->createForStaff($data, $request->user()),
            201
        );
    }

    public function approve(Request $request, int $id)
    {
        $data = $request->validate([
            'review_note' => 'nullable|string|max:500',
        ]);

        return response()->json(
            $this->service->approve($id, $data['review_note'] ?? null, $request->user())
        );
    }

    public function reject(Request $request, int $id)
    {
        $data = $request->validate([
            'review_note' => 'required|string|min:3|max:500',
        ]);

        return response()->json(
            $this->service->reject($id, $data['review_note'], $request->user())
        );
    }
}
