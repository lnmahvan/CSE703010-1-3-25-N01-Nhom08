<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LeaveRequestService;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function __construct(private readonly LeaveRequestService $service)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => 'nullable|string',
            'staff_id' => 'nullable',
            'limit' => 'nullable|integer|min:1|max:200',
        ]);

        return response()->json($this->service->listRequests($filters));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'work_schedule_id' => 'required|integer|exists:work_schedules,id',
            'reason' => 'required|string|min:3|max:500',
        ]);

        return response()->json(
            $this->service->createForStaff(
                $data['work_schedule_id'],
                $data['reason'],
                $request->user()
            ),
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
