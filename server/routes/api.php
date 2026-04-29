<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\MyProfessionalProfileController;
use App\Http\Controllers\Api\MyWorkScheduleController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProfessionalProfileController;
use App\Http\Controllers\Api\ShiftSwapRequestController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\WorkScheduleController;
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

    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return array_merge($user->toArray(), [
            'role' => $user->roles->first()?->slug ?? '',
            'permission_slugs' => $user->getPermissionSlugs()
        ]);
    });

    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::get('/roles/{id}/permissions', [PermissionController::class, 'getRolePermissions']);
    Route::put('/roles/{id}/permissions', [PermissionController::class, 'updateRolePermissions']);
    Route::get('/users/{id}/permissions', [PermissionController::class, 'getUserPermissions']);
    Route::put('/users/{id}/permissions', [PermissionController::class, 'updateUserPermissions']);
    Route::get('/my-professional-profile', [MyProfessionalProfileController::class, 'show']);
    Route::put('/my-professional-profile/{professionalProfile}', [MyProfessionalProfileController::class, 'update'])->whereNumber('professionalProfile');
    Route::post('/my-professional-profile/{professionalProfile}/submit', [MyProfessionalProfileController::class, 'submit'])->whereNumber('professionalProfile');

    // Lich lam viec - cho moi user da dang nhap
    Route::get('/my-work-schedule', [MyWorkScheduleController::class, 'index']);
    Route::get('/staff-lookup', [MyWorkScheduleController::class, 'staffLookup']);
    Route::get('/work-shift-templates', [WorkScheduleController::class, 'templates']);
    Route::post('/work-schedules/{schedule}/leave-request', [LeaveRequestController::class, 'store'])->whereNumber('schedule');
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::post('/shift-swap-requests', [ShiftSwapRequestController::class, 'store']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update'])->whereNumber('user');
        Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->whereNumber('user');
        Route::post('/users/{user}/send-reset-otp', [UserController::class, 'sendResetOtp'])->whereNumber('user');
        Route::post('/users/{user}/verify-reset', [UserController::class, 'verifyAndResetPassword'])->whereNumber('user');
        Route::get('/users/history', [UserController::class, 'getHistory']);

        // Staff Routes
        Route::get('/staff', [\App\Http\Controllers\Api\StaffController::class, 'index']);
        Route::post('/staff', [\App\Http\Controllers\Api\StaffController::class, 'store']);
        Route::get('/staff/{staff}', [\App\Http\Controllers\Api\StaffController::class, 'show'])->whereNumber('staff');
        Route::put('/staff/{staff}', [\App\Http\Controllers\Api\StaffController::class, 'update'])->whereNumber('staff');
        Route::put('/staff/{staff}/status', [\App\Http\Controllers\Api\StaffController::class, 'changeStatus'])->whereNumber('staff');
        Route::get('/staff/{staff}/history', [\App\Http\Controllers\Api\StaffController::class, 'history'])->whereNumber('staff');
        Route::post('/staff/{staff}/reset-password', [\App\Http\Controllers\Api\StaffController::class, 'resetPassword'])->whereNumber('staff');
        Route::get('/branches', [\App\Http\Controllers\Api\BranchController::class, 'index']);
        Route::get('/professional-profiles/options', [ProfessionalProfileController::class, 'options']);
        Route::get('/professional-profiles', [ProfessionalProfileController::class, 'index']);
        Route::post('/professional-profiles', [ProfessionalProfileController::class, 'store']);
        Route::get('/professional-profiles/{professionalProfile}', [ProfessionalProfileController::class, 'show'])->whereNumber('professionalProfile');
        Route::post('/professional-profiles/{professionalProfile}', [ProfessionalProfileController::class, 'update'])->whereNumber('professionalProfile');
        Route::post('/professional-profiles/{professionalProfile}/submit', [ProfessionalProfileController::class, 'submit'])->whereNumber('professionalProfile');
        Route::post('/professional-profiles/{professionalProfile}/approve', [ProfessionalProfileController::class, 'approve'])->whereNumber('professionalProfile');
        Route::post('/professional-profiles/{professionalProfile}/reject', [ProfessionalProfileController::class, 'reject'])->whereNumber('professionalProfile');
        Route::post('/professional-profiles/{professionalProfile}/invalidate', [ProfessionalProfileController::class, 'invalidate'])->whereNumber('professionalProfile');
        Route::get('/professional-profiles/{professionalProfile}/history', [ProfessionalProfileController::class, 'history'])->whereNumber('professionalProfile');

        Route::get('/roles', [UserController::class, 'getAllRoles']);
        Route::get('/admin/dashboard-stats', [DashboardController::class, 'getAdminStats']);

        // Work Schedule Management
        Route::get('/work-schedules', [WorkScheduleController::class, 'index']);
        Route::post('/work-schedules', [WorkScheduleController::class, 'store']);
        Route::post('/work-schedules/copy', [WorkScheduleController::class, 'copy']);
        Route::get('/work-schedules/branch-stats', [WorkScheduleController::class, 'branchStats']);
        Route::get('/work-schedules/audit-logs', [WorkScheduleController::class, 'auditLogs']);
        Route::get('/work-schedules/{schedule}', [WorkScheduleController::class, 'show'])->whereNumber('schedule');
        Route::put('/work-schedules/{schedule}', [WorkScheduleController::class, 'update'])->whereNumber('schedule');
        Route::delete('/work-schedules/{schedule}', [WorkScheduleController::class, 'destroy'])->whereNumber('schedule');

        Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
        Route::post('/leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->whereNumber('leaveRequest');
        Route::post('/leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->whereNumber('leaveRequest');

        Route::get('/shift-swap-requests', [ShiftSwapRequestController::class, 'index']);
        Route::post('/shift-swap-requests/{swap}/approve', [ShiftSwapRequestController::class, 'approve'])->whereNumber('swap');
        Route::post('/shift-swap-requests/{swap}/reject', [ShiftSwapRequestController::class, 'reject'])->whereNumber('swap');
    });
});
