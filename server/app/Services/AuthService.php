<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthService
{
    public function __construct(private readonly OtpService $otpService) {}

    public function login(string $loginData, string $password): array
    {
        $user = User::where('email', $loginData)->orWhere('phone', $loginData)->first();

        if (! $user) {
            return $this->response(['message' => 'Account not found'], 404);
        }

        if ($user->status === 'locked') {
            return $this->response(['message' => 'Account is locked'], 403);
        }

        if (! Hash::check($password, $user->password)) {
            return $this->response(['message' => 'Invalid password'], 401);
        }

        $this->otpService->sendLoginOtp($user);

        return $this->response([
            'requires_otp' => true,
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    public function googleLogin(string $accessToken): array
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($accessToken);
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                if ($user->status === 'locked') {
                    return $this->response(['message' => 'Account is locked'], 403);
                }

                $user->load('roles');
                // Fix for old accounts missing roles
                if ($user->roles->isEmpty()) {
                    $patientRole = Role::where('slug', 'benh_nhan')->first();
                    if ($patientRole) {
                        $user->roles()->attach($patientRole->id);
                        $user->load('roles');
                    }
                }

                $token = $user->createToken('DentalProToken')->plainTextToken;

                return $this->response([
                    'requires_otp' => false,
                    'message' => 'Login successful',
                    'token' => $token,
                    'user' => $this->serializeUser($user),
                ]);
            }

            $user = $this->createGoogleUser($googleUser->getName(), $googleUser->getEmail(), $googleUser->getId());
            $this->otpService->sendLoginOtp($user);

            return $this->response([
                'requires_otp' => true,
                'user_id' => $user->id,
                'email' => $user->email,
                'message' => 'Check your email for OTP',
            ]);
        } catch (\Exception $e) {
            return $this->response([
                'message' => 'Google authentication failed',
                'error' => $e->getMessage(),
            ], 401);
        }
    }

    public function verifyLoginOtp(int $userId, string $otp): array
    {
        if (! $this->otpService->verifyLoginOtp($userId, $otp)) {
            return $this->response(['message' => 'Invalid or expired OTP'], 422);
        }

        $user = User::with('roles')->find($userId);

        if (! $user) {
            return $this->response(['message' => 'Account not found'], 404);
        }

        // Fix for old accounts missing roles
        if ($user->roles->isEmpty()) {
            $patientRole = Role::where('slug', 'benh_nhan')->first();
            if ($patientRole) {
                $user->roles()->attach($patientRole->id);
                $user->load('roles');
            }
        }

        $token = $user->createToken('DentalProToken')->plainTextToken;

        return $this->response([
            'message' => "Welcome back {$user->name}",
            'token' => $token,
            'user' => $this->serializeUser($user),
        ]);
    }

    public function logout(User $user): array
    {
        $user->currentAccessToken()?->delete();

        return $this->response(['message' => 'Logout successful']);
    }

    private function createGoogleUser(string $name, string $email, string $googleId): User
    {
        $username = explode('@', $email)[0].'_'.rand(1000, 9999);

        $user = User::create([
            'name' => $name,
            'username' => $username,
            'email' => $email,
            'password' => Hash::make(Str::random(16)),
            'status' => 'active',
            'google_id' => $googleId,
        ]);

        $patientRole = Role::where('slug', 'benh_nhan')->first();

        if ($patientRole) {
            $user->roles()->attach($patientRole->id);
        }

        return $user->load('roles');
    }

    private function serializeUser(User $user): array
    {
        return array_merge($user->toArray(), [
            'role' => $user->roles->first()?->slug ?? '',
            'permission_slugs' => $user->getPermissionSlugs(),
        ]);
    }

    private function response(array $data, int $status = 200): array
    {
        return ['data' => $data, 'status' => $status];
    }
}
