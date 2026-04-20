<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Check quyền: Chỉ Admin mới được xem danh sách user
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }
        
        return response()->json(User::all(), 200);
    }

    public function toggleStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $user = User::findOrFail($id);
        
        // Không cho phép Admin tự khóa mình
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể tự khóa tài khoản của mình'], 400);
        }

        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();

        return response()->json(['message' => 'Đã cập nhật trạng thái', 'user' => $user], 200);
    }
}