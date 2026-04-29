<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProfessionalProfile;
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
     * BUG-1 FIX: Tạo Staff trước, lấy ID thực tế, rồi update employee_code.
     * BUG-11 FIX: Validate đầy đủ các field mở rộng.
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
            // Field mở rộng (BUG-11)
            'birthday' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'id_card' => 'nullable|string|max:32',
            'nationality' => 'nullable|string|max:255',
            'highest_degree' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'school' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1950|max:2100',
            'practice_certificate' => 'nullable|string|max:255',
            'base_salary' => 'nullable|numeric|min:0',
            'salary_type' => 'nullable|in:hourly,monthly',
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:64',
            'tax_code' => 'nullable|string|max:32',
        ]);

        try {
            DB::beginTransaction();

            // 1. Tạo User (Tài khoản liên kết)
            $username = explode('@', $validated['email'])[0] . '_' . rand(1000, 9999);
            
            // Tạo employee_code tạm — sẽ cập nhật sau khi có staff ID
            $tempCode = 'NV_TEMP_' . Str::random(6);

            $user = User::create([
                'name' => $validated['full_name'],
                'username' => $username,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'employee_id' => $tempCode,
                'password' => Hash::make(Str::random(12)),
                'status' => (isset($validated['status']) && in_array($validated['status'], ['suspended', 'resigned'])) ? 'locked' : 'active',
            ]);

            // Gán Role cho User
            $role = Role::where('slug', $validated['role_slug'])->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            // 2. Tạo Staff (Hồ sơ nhân sự) — chưa có employee_code chính thức
            $staffData = array_merge($validated, [
                'employee_code' => $tempCode,
                'user_id' => $user->id,
                'status' => $validated['status'] ?? 'working',
            ]);
            
            $staff = Staff::create($staffData);

            // BUG-1 FIX: Cập nhật employee_code từ ID thực tế (tránh race condition)
            $employeeCode = 'NV' . str_pad($staff->id, 4, '0', STR_PAD_LEFT);
            $staff->update(['employee_code' => $employeeCode]);
            $user->update(['employee_id' => $employeeCode]);

            // Ghi AuditLog
            $this->logAction($request->user(), "Thêm mới nhân sự: {$staff->full_name} ({$employeeCode})", [
                'staff_id' => $staff->id,
            ]);

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
     * BUG-2 FIX: Kiểm tra hồ sơ chuyên môn trước khi cho đổi vai trò.
     * BUG-11 FIX: Validate đầy đủ các field mở rộng.
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
            // Field mở rộng (BUG-11)
            'birthday' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'id_card' => 'nullable|string|max:32',
            'nationality' => 'nullable|string|max:255',
            'highest_degree' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'school' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1950|max:2100',
            'practice_certificate' => 'nullable|string|max:255',
            'base_salary' => 'nullable|numeric|min:0',
            'salary_type' => 'nullable|in:hourly,monthly',
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:64',
            'tax_code' => 'nullable|string|max:32',
        ]);

        try {
            DB::beginTransaction();

            $oldData = $staff->toArray();

            // BUG-2 FIX: Kiểm tra hồ sơ chuyên môn trước khi đổi vai trò
            if ($oldData['role_slug'] !== $validated['role_slug']) {
                $hasLinkedProfile = ProfessionalProfile::where('staff_id', $staff->id)
                    ->where('profile_role', $oldData['role_slug'])
                    ->whereNotIn('status', ['inactive'])
                    ->exists();

                if ($hasLinkedProfile) {
                    return response()->json([
                        'message' => 'Không thể đổi vai trò. Nhân sự đang có hồ sơ chuyên môn liên kết. Vui lòng vô hiệu hóa hồ sơ chuyên môn trước.',
                    ], 422);
                }
            }

            $staff->update($validated);

            // Cập nhật User liên kết
            if ($staff->user_id) {
                $user = User::find($staff->user_id);
                if ($user) {
                    $user->update([
                        'name' => $validated['full_name'],
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
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
                'staff_id' => $staff->id,
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
     * BUG-3 FIX: Đồng bộ Professional Profile khi đổi trạng thái.
     * Yêu cầu #3: Tự động kích hoạt lại khi chuyển về working.
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

            // BUG-3 FIX: Đồng bộ Professional Profile
            if (in_array($newStatus, ['suspended', 'resigned'])) {
                // Vô hiệu hóa tất cả hồ sơ chuyên môn đang hoạt động
                $deactivatedCount = ProfessionalProfile::where('staff_id', $staff->id)
                    ->whereNotIn('status', ['inactive', 'expired'])
                    ->update([
                        'status' => ProfessionalProfile::STATUS_INACTIVE,
                        'is_active' => false,
                        'invalidated_at' => now(),
                    ]);

                if ($deactivatedCount > 0) {
                    $this->logAction($request->user(), "Tự động vô hiệu hóa {$deactivatedCount} hồ sơ chuyên môn do nhân sự {$staff->full_name} ({$staff->employee_code}) chuyển trạng thái sang {$newStatus}", [
                        'staff_id' => $staff->id,
                    ]);
                }
            } elseif ($newStatus === 'working' && in_array($oldStatus, ['suspended', 'resigned'])) {
                // Yêu cầu #3: Tự động kích hoạt lại hồ sơ chuyên môn
                $reactivatedCount = ProfessionalProfile::where('staff_id', $staff->id)
                    ->where('status', ProfessionalProfile::STATUS_INACTIVE)
                    ->update([
                        'status' => ProfessionalProfile::STATUS_DRAFT,
                        'is_active' => true,
                        'invalidated_at' => null,
                        'invalidated_by' => null,
                    ]);

                if ($reactivatedCount > 0) {
                    $this->logAction($request->user(), "Tự động kích hoạt lại {$reactivatedCount} hồ sơ chuyên môn do nhân sự {$staff->full_name} ({$staff->employee_code}) quay lại làm việc", [
                        'staff_id' => $staff->id,
                    ]);
                }
            }

            // Ghi AuditLog
            $this->logAction($request->user(), "Thay đổi trạng thái nhân sự {$staff->full_name} ({$staff->employee_code}) từ {$oldStatus} sang {$newStatus}", [
                'staff_id' => $staff->id,
            ]);

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
     * BUG-4 FIX: Đặt lại mật khẩu cho nhân viên
     */
    public function resetPassword(Request $request, string $id)
    {
        $staff = Staff::findOrFail($id);

        if (!$staff->user_id) {
            return response()->json(['message' => 'Nhân sự này chưa có tài khoản liên kết.'], 422);
        }

        $user = User::findOrFail($staff->user_id);
        $temporaryPassword = Str::random(10);

        $user->update([
            'password' => Hash::make($temporaryPassword),
        ]);

        // Ghi AuditLog
        $this->logAction($request->user(), "Đặt lại mật khẩu cho nhân sự {$staff->full_name} ({$staff->employee_code})", [
            'staff_id' => $staff->id,
        ]);

        return response()->json([
            'message' => 'Đặt lại mật khẩu thành công',
            'username' => $user->username,
            'temporary_password' => $temporaryPassword,
        ]);
    }

    /**
     * Lấy lịch sử thay đổi của một nhân viên
     * BUG-5 FIX: Query chính xác hơn bằng staff_id trong details JSON
     */
    public function history(string $id)
    {
        $staff = Staff::findOrFail($id);

        // Tìm log theo cả employee_code trong action VÀ staff_id trong details
        $logs = AuditLog::where(function ($q) use ($staff) {
            $q->where('action', 'like', "%{$staff->employee_code}%")
              ->orWhere('details', 'like', '%"staff_id":' . $staff->id . '%')
              ->orWhere('details', 'like', '%"staff_id": ' . $staff->id . '%');
        })
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
