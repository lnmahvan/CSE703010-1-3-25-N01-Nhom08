<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserService
{
    public function __construct(private readonly OtpService $otpService) {}

    public function getAllRoles(): array
    {
        return Role::all()->all();
    }

    public function getHistory(): array
    {
        return AuditLog::orderBy('id', 'desc')->get()->all();
    }

    public function listUsers(array $filters): array
    {
        $query = User::with('roles');

        if (! empty($filters['role_id'])) {
            $query->whereHas('roles', function ($q) use ($filters) {
                $q->where('roles.id', $filters['role_id']);
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('id', 'desc')->paginate(10)->toArray();
    }

    public function createUser(array $data, User $admin): array
    {
        $role = Role::findOrFail($data['role_id']);

        return DB::transaction(function () use ($data, $admin, $role) {
            $employeeId = $this->nextEmployeeId($role);

            $user = User::create([
                'employee_id' => $employeeId,
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'status' => 'active',
                'password' => Hash::make($data['password']),
                'avatar' => $data['avatar'] ?? null,
                'linked_profile_id' => $data['linked_profile_id'] ?? null,
            ]);

            $user->roles()->attach($data['role_id']);

            $this->audit($admin, 'Create', "Created account @{$user->username} ({$user->employee_id})");

            return $user->load('roles')->toArray();
        });
    }

    public function updateUser(User $user, array $data, User $admin): array
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'linked_profile_id' => $data['linked_profile_id'] ?? null,
        ]);

        $user->roles()->sync([$data['role_id']]);

        $this->audit($admin, 'Update', "Updated account @{$user->username}");

        return $user->load('roles')->toArray();
    }

    public function toggleUserStatus(User $user, User $currentUser): array
    {
        if ($currentUser->id === $user->id) {
            return ['data' => ['message' => 'You cannot lock your own active session account'], 'status' => 403];
        }

        if ($user->hasRole('admin') && $user->status === 'active') {
            $activeAdminsCount = User::whereHas('roles', function ($q) {
                $q->where('slug', 'admin');
            })->where('status', 'active')->count();

            if ($activeAdminsCount <= 1) {
                return ['data' => ['message' => 'At least one active admin account is required'], 'status' => 403];
            }
        }

        $user->status = $user->status === 'active' ? 'locked' : 'active';
        $user->save();

        $this->audit(
            $currentUser,
            $user->status === 'active' ? 'Unlock' : 'Lock',
            ($user->status === 'active' ? 'Unlocked' : 'Locked')." account @{$user->username}"
        );

        return [
            'data' => [
                'message' => $user->status === 'active' ? 'User unlocked successfully' : 'User locked successfully',
            ],
            'status' => 200,
        ];
    }

    public function sendAdminResetOtp(User $user): array
    {
        if ($user->google_id) {
            return ['data' => ['message' => 'Google accounts cannot be reset with password OTP'], 'status' => 400];
        }

        try {
            $this->otpService->sendAdminResetOtp($user);

            return ['data' => ['message' => 'Reset OTP sent successfully'], 'status' => 200];
        } catch (\Exception $e) {
            Log::error('Failed to send admin reset OTP: '.$e->getMessage());

            return ['data' => ['message' => 'Email configuration error'], 'status' => 500];
        }
    }

    public function verifyAndResetPassword(User $user, string $otp, string $newPassword, User $admin): array
    {
        if (! $this->otpService->verifyAdminResetOtp($user, $otp)) {
            return ['data' => ['message' => 'Invalid or expired OTP'], 'status' => 400];
        }

        $user->password = Hash::make($newPassword);
        $user->save();

        $this->audit($admin, 'Reset password', "Reset password for @{$user->username}");

        return ['data' => ['message' => 'Password reset successfully'], 'status' => 200];
    }

    private function nextEmployeeId(Role $role): string
    {
        $prefixes = ['admin' => 'AD', 'bac_si' => 'BS', 'le_tan' => 'LT', 'ke_toan' => 'KT', 'benh_nhan' => 'BN'];
        $prefix = $prefixes[$role->slug] ?? 'NV';
        $lastEmployeeId = User::where('employee_id', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByRaw('CAST(SUBSTRING(employee_id, 3) AS UNSIGNED) DESC')
            ->value('employee_id');

        $nextNumber = $lastEmployeeId ? ((int) substr($lastEmployeeId, 2)) + 1 : 1;

        do {
            $employeeId = $prefix.str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
            $exists = User::where('employee_id', $employeeId)->exists();
            $nextNumber++;
        } while ($exists);

        return $employeeId;
    }

    private function audit(User $admin, string $action, string $details): void
    {
        AuditLog::create([
            'admin_id' => $admin->id,
            'admin_name' => $admin->name,
            'action' => $action,
            'details' => $details,
        ]);
    }
}
