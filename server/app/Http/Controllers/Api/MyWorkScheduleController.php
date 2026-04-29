<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Services\WorkScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyWorkScheduleController extends Controller
{
    public function __construct(private readonly WorkScheduleService $service)
    {
    }

    public function index(Request $request)
    {
        $data = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $staff = Staff::where('user_id', $request->user()->id)->first();

        if (! $staff) {
            return response()->json([
                'data' => [],
                'message' => 'Tai khoan chua duoc lien ket voi nhan su nao.',
            ]);
        }

        return response()->json([
            'staff' => $staff->only(['id', 'employee_code', 'full_name', 'role_slug', 'status']),
            'data' => $this->service->getSchedulesForStaff(
                $staff->id,
                $data['from'] ?? null,
                $data['to'] ?? null
            ),
        ]);
    }

    public function staffLookup(): JsonResponse
    {
        $staff = Staff::query()
            ->where('status', 'working')
            ->orderBy('full_name')
            ->get(['id', 'employee_code', 'full_name', 'role_slug', 'status']);

        return response()->json($staff);
    }
}
