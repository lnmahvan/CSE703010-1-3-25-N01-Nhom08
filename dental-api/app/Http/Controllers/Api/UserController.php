<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role; // THÊM MODEL ROLE
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    // API CUNG CẤP DANH SÁCH ROLE CHO FRONTEND
    public function getAllRoles()
    {
        return response()->json(Role::all());
    }

    public function getHistory(Request $request)
    {
        // Kiểm tra quyền Admin qua bảng roles
        if (!$request->user()->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }
        
        return response()->json(AuditLog::orderBy('id', 'desc')->get());
    }

    public function index(Request $request)
    {
        if (!$request->user()->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Kéo thêm bảng roles
        $query = User::with('roles');

        // Lọc theo role_id thay vì role
        if ($request->has('role_id') && $request->role_id != '') {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('roles.id', $request->role_id);
            });
        }

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('id', 'desc')->paginate(10));
    }

    public function store(Request $request)
    {
        if (!$request->user()->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|unique:users',
            'password' => 'required|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', 
            'role_id' => 'required|exists:roles,id', // Đổi thành role_id
            'linked_profile_id' => 'nullable|integer'
        ], [
            'username.unique' => 'Tên đăng nhập đã tồn tại',
            'email.unique' => 'Email đã được sử dụng',
            'phone.unique' => 'Số điện thoại đã được sử dụng',
            'password.regex' => 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
        ]);

        $role = Role::findOrFail($request->role_id);
        $prefixes = ['admin'=>'AD', 'bac_si'=>'BS', 'le_tan'=>'LT', 'ke_toan'=>'KT', 'benh_nhan'=>'BN'];
        $prefix = $prefixes[$role->slug] ?? 'NV';
        
        $lastUser = User::whereHas('roles', function($q) use ($role) {
            $q->where('roles.id', $role->id);
        })->orderBy('id', 'desc')->first();

        $newNumber = ($lastUser && $lastUser->employee_id) ? ((int) substr($lastUser->employee_id, 2)) + 1 : 1;
        $employeeId = $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        $user = User::create([
            'employee_id' => $employeeId,
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => 'active', 
            'password' => Hash::make($request->password),
            'avatar' => $request->avatar ?? null,
            'linked_profile_id' => $request->linked_profile_id ?? null
        ]);

        // Lưu vai trò vào bảng role_user
        $user->roles()->attach($request->role_id);

        AuditLog::create([
            'admin_id' => $request->user()->id,
            'admin_name' => $request->user()->name,
            'action' => 'Tạo mới',
            'details' => "Đã tạo tài khoản @{$user->username} (Mã: {$user->employee_id})"
        ]);

        return response()->json(['message' => 'Tạo tài khoản thành công', 'user' => $user], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,'.$id,
            'phone' => 'nullable|string|unique:users,phone,'.$id,
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->update($request->only(['name', 'email', 'phone', 'linked_profile_id']));
        
        // Cập nhật lại vai trò
        $user->roles()->sync([$request->role_id]);
        
        AuditLog::create([
            'admin_id' => $request->user()->id,
            'admin_name' => $request->user()->name,
            'action' => 'Chỉnh sửa',
            'details' => "Đã cập nhật thông tin tài khoản @{$user->username}"
        ]);

        return response()->json(['message' => 'Cập nhật tài khoản thành công', 'user' => $user]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $userToToggle = User::findOrFail($id);
        $currentUser = $request->user();

        if ($currentUser->id === $userToToggle->id) {
            return response()->json(['message' => 'Không thể khóa tài khoản đang đăng nhập'], 403);
        }

        // Check xem có phải Admin không qua bảng roles
        if ($userToToggle->roles()->where('slug', 'admin')->exists() && $userToToggle->status === 'active') {
            $activeAdminsCount = User::whereHas('roles', function($q) {
                $q->where('slug', 'admin');
            })->where('status', 'active')->count();

            if ($activeAdminsCount <= 1) {
                return response()->json(['message' => 'Phải tồn tại ít nhất một tài khoản Admin đang hoạt động'], 403);
            }
        }

        $userToToggle->status = $userToToggle->status === 'active' ? 'locked' : 'active';
        $userToToggle->save();

        AuditLog::create([
            'admin_id' => $currentUser->id,
            'admin_name' => $currentUser->name,
            'action' => $userToToggle->status === 'active' ? 'Mở khóa' : 'Khóa',
            'details' => "Đã " . ($userToToggle->status === 'active' ? 'mở khóa' : 'khóa') . " tài khoản @{$userToToggle->username}"
        ]);

        return response()->json(['message' => $userToToggle->status === 'active' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản']);
    }

    public function sendResetOtp(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        if ($user->google_id) {
            return response()->json(['message' => 'Tài khoản này sử dụng đăng nhập Google, không thể đổi mật khẩu!'], 400);
        }

        $otp = rand(100000, 999999);
        Cache::put('reset_otp_' . $user->id, $otp, now()->addMinutes(5));

        try {
            $mailContent = "Xin chào {$user->name},\n\nMã OTP để đặt lại mật khẩu tài khoản Dental Pro của bạn là: {$otp}\n\nMã này có hiệu lực trong 5 phút.\n\nTrân trọng,\nPhòng khám Dental Pro";
            
            Mail::raw($mailContent, function($message) use ($user) {
                $message->to($user->email)->subject('Mã OTP đặt lại mật khẩu - Dental Pro');
            });

            return response()->json(['message' => 'Đã gửi mã OTP về email thành công!']);
        } catch (\Exception $e) {
            Log::error("Lỗi gửi mail: " . $e->getMessage());
            return response()->json(['message' => "Lỗi cấu hình gửi Email. Vui lòng kiểm tra lại file .env"], 500);
        }
    }

    public function verifyAndResetPassword(Request $request, $id)
    {
        $request->validate([
            'otp' => 'required',
            'new_password' => 'required|min:8'
        ]);

        $user = User::findOrFail($id);
        $cachedOtp = Cache::get('reset_otp_' . $user->id);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json(['message' => 'Mã OTP không hợp lệ hoặc đã hết hạn!'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        Cache::forget('reset_otp_' . $user->id);

        AuditLog::create([
            'admin_id' => $request->user()->id,
            'admin_name' => $request->user()->name,
            'action' => 'Đặt lại mật khẩu',
            'details' => "Đã xác thực OTP và đổi mật khẩu mới cho @{$user->username}"
        ]);

        return response()->json(['message' => 'Đổi mật khẩu mới thành công!']);
    }
}