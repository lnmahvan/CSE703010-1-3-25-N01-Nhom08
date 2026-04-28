<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\AuditLog;

class PermissionController extends Controller
{
    // Lấy toàn bộ danh sách quyền, nhóm theo module
    public function index(Request $request)
    {
        // Yêu cầu: Chỉ Admin được phân quyền
        if (!$request->user()->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $permissions = Permission::all();
        
        $grouped = [];
        foreach ($permissions as $p) {
            if (!isset($grouped[$p->module])) {
                $grouped[$p->module] = [];
            }
            $grouped[$p->module][] = $p;
        }

        return response()->json($grouped);
    }

    // Lấy danh sách ID các quyền của một Vai trò
    public function getRolePermissions(Request $request, int $roleId)
    {
        if (!$request->user()->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $role = Role::findOrFail($roleId);
        $permissionIds = $role->permissions()->pluck('permissions.id');

        return response()->json(['permission_ids' => $permissionIds]);
    }

    // Lấy danh sách ID các quyền riêng của một Tài khoản
    public function getUserPermissions(Request $request, int $userId)
    {
        if (!$request->user()->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $user = User::findOrFail($userId);
        $permissionIds = $user->permissions()->pluck('permissions.id');

        return response()->json(['permission_ids' => $permissionIds]);
    }

    // Cập nhật quyền cho Vai trò
    public function updateRolePermissions(Request $request, int $roleId)
    {
        $admin = $request->user();
        if (!$admin->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $request->validate([
            'permission_ids' => 'array'
        ]);

        $role = Role::findOrFail($roleId);
        
        // E1. Không được xóa toàn bộ quyền của vai trò Admin
        if ($role->slug === 'admin' && empty($request->permission_ids)) {
            return response()->json(['message' => 'Không được xóa toàn bộ quyền của vai trò Admin'], 400);
        }

        $role->permissions()->sync($request->permission_ids ?? []);

        AuditLog::create([
            'admin_id' => $admin->id,
            'admin_name' => $admin->name,
            'action' => 'Phân quyền Role',
            'details' => "Đã cập nhật quyền cho vai trò {$role->name}"
        ]);

        return response()->json(['message' => 'Cập nhật quyền vai trò thành công']);
    }

    // Cập nhật quyền riêng cho Tài khoản
    public function updateUserPermissions(Request $request, int $userId)
    {
        $admin = $request->user();
        if (!$admin->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $request->validate([
            'permission_ids' => 'array'
        ]);

        $targetUser = User::findOrFail($userId);

        // E2. Admin tự gỡ quyền quản trị của chính mình? 
        // Phức tạp hơn: Nếu target user là chính admin này, và họ gỡ hết quyền, thì... 
        if ($targetUser->id === $admin->id && empty($request->permission_ids) && $targetUser->roles()->where('slug', 'admin')->exists()) {
            return response()->json(['message' => 'Không thể gỡ toàn bộ quyền riêng của chính mình khi đang là Admin'], 400);
        }

        $targetUser->permissions()->sync($request->permission_ids ?? []);

        AuditLog::create([
            'admin_id' => $admin->id,
            'admin_name' => $admin->name,
            'action' => 'Phân quyền User',
            'details' => "Đã cập nhật quyền riêng cho tài khoản {$targetUser->username}"
        ]);

        return response()->json(['message' => 'Cập nhật quyền tài khoản thành công']);
    }
}
