<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-login-otp', [AuthController::class, 'verifyLoginOtp']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

Route::post('/password/forgot/send-otp', [PasswordResetController::class, 'sendResetOtp']);
Route::post('/password/forgot/verify-otp', [PasswordResetController::class, 'verifyResetOtp']);
Route::post('/password/forgot/reset', [PasswordResetController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    Route::middleware('isAdmin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update'])->whereNumber('user');
        Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->whereNumber('user');
        Route::post('/users/{user}/send-reset-otp', [UserController::class, 'sendResetOtp'])->whereNumber('user');
        Route::post('/users/{user}/verify-reset', [UserController::class, 'verifyAndResetPassword'])->whereNumber('user');
        Route::get('/users/history', [UserController::class, 'getHistory']);

        Route::get('/roles', [UserController::class, 'getAllRoles']);
        Route::get('/admin/dashboard-stats', [DashboardController::class, 'getAdminStats']);
    });
});
