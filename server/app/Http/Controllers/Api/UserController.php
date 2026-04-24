<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService) {}

    public function getAllRoles()
    {
        return response()->json($this->userService->getAllRoles());
    }

    public function getHistory()
    {
        return response()->json($this->userService->getHistory());
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'nullable|integer|exists:roles,id',
            'status' => 'nullable|in:active,locked',
            'search' => 'nullable|string|max:255',
        ]);

        return response()->json($this->userService->listUsers($validated));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20|unique:users',
            'password' => 'required|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'role_id' => 'required|integer|exists:roles,id',
            'linked_profile_id' => 'nullable|integer',
        ]);

        $user = $this->userService->createUser($validated, $request->user());

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20|unique:users,phone,'.$user->id,
            'role_id' => 'required|integer|exists:roles,id',
            'linked_profile_id' => 'nullable|integer',
        ]);

        $updatedUser = $this->userService->updateUser($user, $validated, $request->user());

        return response()->json(['message' => 'User updated successfully', 'user' => $updatedUser]);
    }

    public function toggleStatus(Request $request, User $user)
    {
        $result = $this->userService->toggleUserStatus($user, $request->user());

        return response()->json($result['data'], $result['status']);
    }

    public function sendResetOtp(Request $request, User $user)
    {
        $result = $this->userService->sendAdminResetOtp($user);

        return response()->json($result['data'], $result['status']);
    }

    public function verifyAndResetPassword(Request $request, User $user)
    {
        $request->validate([
            'otp' => 'required|string|digits:6',
            'new_password' => 'required|string|min:8',
        ]);

        $result = $this->userService->verifyAndResetPassword(
            $user,
            (string) $request->input('otp'),
            (string) $request->input('new_password'),
            $request->user()
        );

        return response()->json($result['data'], $result['status']);
    }
}
