<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller
{
    public function __construct(private readonly OtpService $otpService) {}

    public function sendResetOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $result = $this->otpService->requestPublicPasswordReset((string) $request->input('email'));

        return response()->json($result['data'], $result['status']);
    }

    public function verifyResetOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
        ]);

        $result = $this->otpService->verifyPublicPasswordResetOtp(
            (string) $request->input('email'),
            (string) $request->input('otp')
        );

        return response()->json($result['data'], $result['status']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'reset_token' => 'required',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $result = $this->otpService->resetPublicPassword(
            (string) $request->input('email'),
            (string) $request->input('reset_token'),
            (string) $request->input('password')
        );

        return response()->json($result['data'], $result['status']);
    }
}
