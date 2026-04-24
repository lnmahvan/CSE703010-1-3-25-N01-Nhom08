<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function getAllRoles()
    {
        Gate::authorize('viewAny', User::class);

        return response()->json(Role::all());
    }

    public function getHistory()
    {
        Gate::authorize('viewAny', User::class);

        return response()->json(AuditLog::orderBy('id', 'desc')->get());
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        $request->validate([
            'role_id' => 'nullable|integer|exists:roles,id',
            'status' => 'nullable|in:active,locked',
            'search' => 'nullable|string|max:255',
        ]);

        $query = User::with('roles');

        if ($request->filled('role_id')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('roles.id', $request->role_id);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $search = $request->input('search');
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
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
        Gate::authorize('create', User::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20|unique:users',
            'password' => 'required|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'role_id' => 'required|integer|exists:roles,id',
            'linked_profile_id' => 'nullable|integer',
        ]);

        $role = Role::findOrFail($request->role_id);
        $prefixes = ['admin' => 'AD', 'bac_si' => 'BS', 'le_tan' => 'LT', 'ke_toan' => 'KT', 'benh_nhan' => 'BN'];
        $prefix = $prefixes[$role->slug] ?? 'NV';

        $lastUser = User::whereHas('roles', function ($q) use ($role) {
            $q->where('roles.id', $role->id);
        })->orderBy('id', 'desc')->first();

        $newNumber = ($lastUser && $lastUser->employee_id) ? ((int) substr($lastUser->employee_id, 2)) + 1 : 1;
        $employeeId = $prefix.str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        $user = User::create([
            'employee_id' => $employeeId,
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => 'active',
            'password' => Hash::make($request->password),
            'avatar' => $request->avatar ?? null,
            'linked_profile_id' => $request->linked_profile_id ?? null,
        ]);

        $user->roles()->attach($request->role_id);

        AuditLog::create([
            'admin_id' => $request->user()->id,
            'admin_name' => $request->user()->name,
            'action' => 'Create',
            'details' => "Created account @{$user->username} ({$user->employee_id})",
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function update(Request $request, User $user)
    {
        Gate::authorize('update', $user);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20|unique:users,phone,'.$user->id,
            'role_id' => 'required|integer|exists:roles,id',
            'linked_profile_id' => 'nullable|integer',
        ]);

        $user->update($request->only(['name', 'email', 'phone', 'linked_profile_id']));
        $user->roles()->sync([$request->role_id]);

        AuditLog::create([
            'admin_id' => $request->user()->id,
            'admin_name' => $request->user()->name,
            'action' => 'Update',
            'details' => "Updated account @{$user->username}",
        ]);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function toggleStatus(Request $request, User $user)
    {
        Gate::authorize('toggleStatus', $user);

        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'You cannot lock your own active session account'], 403);
        }

        if ($user->roles()->where('slug', 'admin')->exists() && $user->status === 'active') {
            $activeAdminsCount = User::whereHas('roles', function ($q) {
                $q->where('slug', 'admin');
            })->where('status', 'active')->count();

            if ($activeAdminsCount <= 1) {
                return response()->json(['message' => 'At least one active admin account is required'], 403);
            }
        }

        $user->status = $user->status === 'active' ? 'locked' : 'active';
        $user->save();

        AuditLog::create([
            'admin_id' => $currentUser->id,
            'admin_name' => $currentUser->name,
            'action' => $user->status === 'active' ? 'Unlock' : 'Lock',
            'details' => ($user->status === 'active' ? 'Unlocked' : 'Locked')." account @{$user->username}",
        ]);

        return response()->json([
            'message' => $user->status === 'active' ? 'User unlocked successfully' : 'User locked successfully',
        ]);
    }

    public function sendResetOtp(Request $request, User $user)
    {
        Gate::authorize('resetPassword', $user);

        if ($user->google_id) {
            return response()->json(['message' => 'Google accounts cannot be reset with password OTP'], 400);
        }

        $otp = rand(100000, 999999);
        Cache::put('reset_otp_'.$user->id, $otp, now()->addMinutes(5));

        try {
            $mailContent = "Hello {$user->name},\n\nYour Dental Pro password reset OTP is: {$otp}\n\nThis code expires in 5 minutes.";

            Mail::raw($mailContent, function ($message) use ($user) {
                $message->to($user->email)->subject('Dental Pro password reset OTP');
            });

            return response()->json(['message' => 'Reset OTP sent successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to send reset OTP: '.$e->getMessage());

            return response()->json(['message' => 'Email configuration error'], 500);
        }
    }

    public function verifyAndResetPassword(Request $request, User $user)
    {
        Gate::authorize('resetPassword', $user);

        $request->validate([
            'otp' => 'required|string|digits:6',
            'new_password' => 'required|string|min:8',
        ]);

        $cachedOtp = Cache::get('reset_otp_'.$user->id);

        if (! $cachedOtp || $cachedOtp != $request->otp) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        Cache::forget('reset_otp_'.$user->id);

        AuditLog::create([
            'admin_id' => $request->user()->id,
            'admin_name' => $request->user()->name,
            'action' => 'Reset password',
            'details' => "Reset password for @{$user->username}",
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }
}
