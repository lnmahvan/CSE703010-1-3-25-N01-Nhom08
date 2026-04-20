<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PasswordResetController;

// --- NHÓM 1: CÁC ROUTE KHÔNG CẦN TOKEN (Public) ---

// Bước 1: Nhập Email/Pass -> Trả về requires_otp
Route::post('/login', [AuthController::class, 'login']);

// Bước 2: Nhập mã OTP từ Mail -> Trả về Token chính thức
Route::post('/verify-login-otp', [AuthController::class, 'verifyLoginOtp']);

// Đăng nhập Google
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

// UC1.2: Khôi phục mật khẩu (ĐÃ ĐƯỢC CHUYỂN RA NGOÀI VÙNG PUBLIC)
Route::post('/password/forgot/send-otp', [PasswordResetController::class, 'sendResetOtp']);
Route::post('/password/forgot/verify-otp', [PasswordResetController::class, 'verifyResetOtp']);
Route::post('/password/forgot/reset', [PasswordResetController::class, 'resetPassword']);


// --- NHÓM 2: CÁC ROUTE BẮT BUỘC PHẢI CÓ TOKEN (Private) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // UC1.2 Đăng xuất
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Lấy thông tin cá nhân
    Route::get('/me', function (Illuminate\Http\Request $request) {
        return $request->user();
    });

    // UC2: Quản lý người dùng
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
});