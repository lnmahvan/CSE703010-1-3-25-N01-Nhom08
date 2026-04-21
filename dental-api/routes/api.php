<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PasswordResetController;

// --- NHÓM 1: CÁC ROUTE KHÔNG CẦN TOKEN (Public) ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-login-otp', [AuthController::class, 'verifyLoginOtp']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

Route::post('/password/forgot/send-otp', [PasswordResetController::class, 'sendResetOtp']);
Route::post('/password/forgot/verify-otp', [PasswordResetController::class, 'verifyResetOtp']);
Route::post('/password/forgot/reset', [PasswordResetController::class, 'resetPassword']);

// --- NHÓM 2: CÁC ROUTE BẮT BUỘC PHẢI CÓ TOKEN (Private) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Đăng xuất
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Lấy thông tin cá nhân
    Route::get('/me', function (Illuminate\Http\Request $request) {
        return $request->user();
    });

    // UC2: Quản lý người dùng
    Route::get('/users', [UserController::class, 'index']);// Danh sách user, hỗ trợ tìm kiếm và lọc
    Route::post('/users', [UserController::class, 'store']); // Thêm mới user
    Route::put('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);// Khóa/Mở khóa tài khoản
    Route::put('/users/{id}', [UserController::class, 'update']);// Cập nhật thông tin user
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']); // Đặt lại mật khẩu

    // Bảng điều khiển Admin
    Route::get('/admin/dashboard-stats', [\App\Http\Controllers\Api\DashboardController::class, 'getAdminStats']);
});