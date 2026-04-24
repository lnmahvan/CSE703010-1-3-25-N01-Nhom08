<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(Request $request)
    {
        $result = $this->authService->login(
            (string) $request->input('email'),
            (string) $request->input('password')
        );

        return response()->json($result['data'], $result['status']);
    }

    public function googleLogin(Request $request)
    {
        $result = $this->authService->googleLogin((string) $request->input('access_token'));

        return response()->json($result['data'], $result['status']);
    }

    public function verifyLoginOtp(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'otp' => 'required',
        ]);

        $result = $this->authService->verifyLoginOtp(
            (int) $request->input('user_id'),
            (string) $request->input('otp')
        );

        return response()->json($result['data'], $result['status']);
    }

    public function logout(Request $request)
    {
        $result = $this->authService->logout($request->user());

        return response()->json($result['data'], $result['status']);
    }
}
