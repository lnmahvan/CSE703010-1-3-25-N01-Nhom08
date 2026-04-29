<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use App\Models\Role;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Staff::with(['user','branch']);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('employee_code', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && !empty($request->role)) {
            $query->where('role_slug', $request->role);
        }

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 10);
        $staff = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($staff);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff,email|unique:users,email',
            'phone' => 'nullable|string|digits:10|unique:staff,phone',
            'role_slug' => 'required|string|exists:roles,slug',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'join_date' => 'nullable|date',
            'status' => 'nullable|in:working,suspended,resigned',
        ]);

        try {
            DB::beginTransaction();

            $latestStaff = Staff::orderBy('id', 'desc')->first();
            $nextId = $latestStaff ? $latestStaff->id + 1 : 1;
            $employeeCode = 'NV' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

            // 1. Tạo User (Tài khoản liên kết)
            $username = explode('@', $validated['email'])[0] . '_' . rand(1000, 9999);
            
            $user = User::create([
                'name' => $validated['full_name'],
                'username' => $username,
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'employee_id' => $employeeCode,
                'password' => Hash::make(Str::random(12)), // Mật khẩu sinh ngẫu nhiên
                'status' => (isset($validated['status']) && in_array($validated['status'], ['suspended', 'resigned'])) ? 'locked' : 'active',
            ]);

            // Gán Role cho User
            $role = Role::where('slug', $validated['role_slug'])->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            // 2. Tạo Staff (Hồ sơ nhân sự)
            $staffData = array_merge($validated, [
                'employee_code' => $employeeCode,
                'user_id' => $user->id,
                'status' => $validated['status'] ?? 'working',
            ]);
            
            $staff = Staff::create($staffData);

            // Ghi AuditLog
            $this->logAction($request->user(), "Thêm mới nhân sự: {$staff->full_name} ({$staff->employee_code})");

            DB::commit();

            return response()->json([
                'message' => 'Thêm nhân sự thành công',
                'staff' => $staff->load(['user','branch'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $staff = Staff::with(['user','branch'])->findOrFail($id);
        return response()->json($staff);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $staff = Staff::findOrFail($id);

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff,email,' . $id . '|unique:users,email,' . $staff->user_id,
            'phone' => 'nullable|string|digits:10|unique:staff,phone,' . $id,
            'role_slug' => 'required|string|exists:roles,slug',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'join_date' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            $oldData = $staff->toArray();
            $staff->update($validated);

            // Cập nhật User liên kết
            if ($staff->user_id) {
                $user = User::find($staff->user_id);
                if ($user) {
                    $user->update([
                        'name' => $validated['full_name'],
                        'email' => $validated['email'],
                        'phone' => $validated['phone'],
                    ]);

                    // Đồng bộ Role nếu Role thay đổi
                    if ($oldData['role_slug'] !== $validated['role_slug']) {
                        $role = Role::where('slug', $validated['role_slug'])->first();
                        if ($role) {
                            $user->roles()->sync([$role->id]);
                        }
                    }
                }
            }

            // Ghi AuditLog
            $this->logAction($request->user(), "Cập nhật hồ sơ nhân sự: {$staff->full_name} ({$staff->employee_code})", [
                'before' => $oldData,
                'after' => $staff->toArray()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật nhân sự thành công',
                'staff' => $staff->load(['user','branch'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Thay đổi trạng thái làm việc
     */
    public function changeStatus(Request $request, string $id)
    {
        $staff = Staff::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:working,suspended,resigned',
        ]);

        try {
            DB::beginTransaction();

            $oldStatus = $staff->status;
            $newStatus = $validated['status'];

            $staff->update(['status' => $newStatus]);

            // Đồng bộ trạng thái User
            if ($staff->user_id) {
                $user = User::find($staff->user_id);
                if ($user) {
                    if (in_array($newStatus, ['suspended', 'resigned'])) {
                        $user->update(['status' => 'locked']);
                    } else if ($newStatus === 'working') {
                        $user->update(['status' => 'active']);
                    }
                }
            }

            // Ghi AuditLog
            $this->logAction($request->user(), "Thay đổi trạng thái nhân sự {$staff->full_name} ({$staff->employee_code}) từ {$oldStatus} sang {$newStatus}");

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật trạng thái thành công',
                'staff' => $staff->fresh()->load(['user','branch'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Lấy lịch sử thay đổi của một nhân viên
     */
    public function history(string $id)
    {
        $staff = Staff::findOrFail($id);
        $logs = AuditLog::where('details', 'like', "%{$staff->employee_code}%")
                        ->orderBy('created_at', 'desc')
                        ->get();
        return response()->json($logs);
    }

    private function logAction($admin, $action, $details = null)
    {
        AuditLog::create([
            'admin_id' => $admin->id ?? 1,
            'admin_name' => $admin->name ?? 'System',
            'action' => $action,
            'details' => $details ? json_encode($details) : json_encode([]),
        ]);
    }
}
