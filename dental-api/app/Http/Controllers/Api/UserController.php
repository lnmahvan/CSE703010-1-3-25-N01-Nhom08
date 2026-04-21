<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    // BƯỚC 2 & 3: Hiển thị danh sách, tìm kiếm, lọc và PHÂN TRANG
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $query = User::query();

        if ($request->has('role') && $request->role != '') {
            $query->where('role', $request->role);
        }

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Đã sửa lại logic tìm kiếm cho chuẩn xác
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

        // Thực hiện phân trang theo đúng đặc tả (10 dòng/trang)
        return response()->json($query->orderBy('id', 'desc')->paginate(10));
    }

    // BƯỚC 4-9: Thêm mới tài khoản (Đủ trường Username, Ảnh, Hồ sơ)
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Bắt ngoại lệ E1, E2, E3
        $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|unique:users',
            'password' => 'required|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', 
            'role' => 'required|in:admin,bac_si,le_tan,ke_toan,benh_nhan',
            'linked_profile_id' => 'nullable|integer'
        ], [
            'username.unique' => 'Tên đăng nhập đã tồn tại',
            'email.unique' => 'Email đã được sử dụng',
            'phone.unique' => 'Số điện thoại đã được sử dụng',
            'password.regex' => 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
        ]);

        $prefixes = ['admin'=>'AD', 'bac_si'=>'BS', 'le_tan'=>'LT', 'ke_toan'=>'KT', 'benh_nhan'=>'BN'];
        $prefix = $prefixes[$request->role];
        
        $lastUser = User::where('role', $request->role)->orderBy('id', 'desc')->first();
        $newNumber = ($lastUser && $lastUser->employee_id) ? ((int) substr($lastUser->employee_id, 2)) + 1 : 1;
        $employeeId = $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        $user = User::create([
            'employee_id' => $employeeId,
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => 'active', 
            'password' => Hash::make($request->password),
            'avatar' => $request->avatar ?? null,
            'linked_profile_id' => $request->linked_profile_id ?? null
        ]);

        // Ghi Log lịch sử
        Log::info("Admin {$request->user()->name} đã tạo tài khoản {$user->username}");

        return response()->json(['message' => 'Tạo tài khoản thành công', 'user' => $user], 201);
    }

    // BƯỚC 10-14: Chỉnh sửa tài khoản
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,'.$id,
            'phone' => 'nullable|string|unique:users,phone,'.$id,
            'role' => 'required|in:admin,bac_si,le_tan,ke_toan,benh_nhan',
        ]);

        $user->update($request->only(['name', 'email', 'phone', 'role', 'linked_profile_id']));
        
        Log::info("Admin {$request->user()->name} đã sửa tài khoản {$user->username}");

        return response()->json(['message' => 'Cập nhật tài khoản thành công', 'user' => $user]);
    }

    // BƯỚC 15-16: Khóa / Mở khóa
    public function toggleStatus(Request $request, $id)
    {
        $userToToggle = User::findOrFail($id);
        $currentUser = $request->user();

        // E5: Không tự khóa mình
        if ($currentUser->id === $userToToggle->id) {
            return response()->json(['message' => 'Không thể khóa tài khoản đang đăng nhập'], 403);
        }

        // E6: Không khóa Admin cuối
        if ($userToToggle->role === 'admin' && $userToToggle->status === 'active') {
            if (User::where('role', 'admin')->where('status', 'active')->count() <= 1) {
                return response()->json(['message' => 'Phải tồn tại ít nhất một tài khoản Admin đang hoạt động'], 403);
            }
        }

        $userToToggle->status = $userToToggle->status === 'active' ? 'locked' : 'active';
        $userToToggle->save();

        Log::info("Admin {$currentUser->name} đã {$userToToggle->status} tài khoản {$userToToggle->username}");

        return response()->json(['message' => $userToToggle->status === 'active' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản']);
    }

    // BƯỚC 17-18: Đặt lại mật khẩu
    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // E7: Không đổi pass cho Google Account
        if ($user->google_id) {
            return response()->json(['message' => 'Tài khoản này sử dụng đăng nhập Google'], 400);
        }

        $newPass = 'Dental@123';
        $user->password = Hash::make($newPass);
        $user->save();

        Log::info("Admin {$request->user()->name} đã đặt lại mật khẩu cho {$user->username}");

        return response()->json(['message' => "Đã đặt lại mật khẩu thành công. Mật khẩu mới: {$newPass}"]);
    }
}