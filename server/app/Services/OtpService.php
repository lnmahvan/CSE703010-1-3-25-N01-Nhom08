<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OtpService
{
    public function sendLoginOtp(User $user): void
    {
        $otp = $this->generateOtp();

        Cache::put($this->loginOtpKey($user->id), $otp, now()->addMinutes(5));

        Mail::raw("Your Dental Pro login OTP is: {$otp}", function ($message) use ($user) {
            $message->to($user->email)->subject('Dental Pro login OTP');
        });
    }

    public function verifyLoginOtp(int $userId, string $otp): bool
    {
        $cachedOtp = Cache::get($this->loginOtpKey($userId));

        if (! $cachedOtp || $cachedOtp != $otp) {
            return false;
        }

        Cache::forget($this->loginOtpKey($userId));

        return true;
    }

    public function sendAdminResetOtp(User $user): void
    {
        $otp = $this->generateOtp();

        Cache::put($this->adminResetOtpKey($user->id), $otp, now()->addMinutes(5));

        $mailContent = "Hello {$user->name},\n\nYour Dental Pro password reset OTP is: {$otp}\n\nThis code expires in 5 minutes.";

        Mail::raw($mailContent, function ($message) use ($user) {
            $message->to($user->email)->subject('Dental Pro password reset OTP');
        });
    }

    public function verifyAdminResetOtp(User $user, string $otp): bool
    {
        $cachedOtp = Cache::get($this->adminResetOtpKey($user->id));

        if (! $cachedOtp || $cachedOtp != $otp) {
            return false;
        }

        Cache::forget($this->adminResetOtpKey($user->id));

        return true;
    }

    public function requestPublicPasswordReset(string $email): array
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return $this->response(['message' => 'Account not found'], 404);
        }

        if (Cache::has($this->publicResetLockKey($user->email))) {
            return $this->response(['message' => 'Password reset is temporarily locked'], 429);
        }

        $otp = $this->generateOtp();

        Cache::put($this->publicResetOtpKey($user->email), $otp, now()->addMinutes(5));
        Cache::forget($this->publicResetAttemptsKey($user->email));

        try {
            Mail::raw("Your Dental Pro password reset OTP is: {$otp}. It expires in 5 minutes.", function ($message) use ($user) {
                $message->to($user->email)->subject('Dental Pro password reset OTP');
            });
        } catch (\Exception) {
            return $this->response(['message' => 'Unable to send OTP email'], 500);
        }

        return $this->response(['message' => 'OTP sent successfully']);
    }

    public function verifyPublicPasswordResetOtp(string $email, string $otp): array
    {
        if (! Cache::has($this->publicResetOtpKey($email))) {
            return $this->response(['message' => 'OTP expired'], 422);
        }

        $cachedOtp = Cache::get($this->publicResetOtpKey($email));

        if ($cachedOtp != $otp) {
            $attempts = Cache::increment($this->publicResetAttemptsKey($email));

            if ($attempts >= 5) {
                Cache::forget($this->publicResetOtpKey($email));
                Cache::forget($this->publicResetAttemptsKey($email));
                Cache::put($this->publicResetLockKey($email), true, now()->addHours(3));

                return $this->response(['message' => 'Too many invalid OTP attempts'], 429);
            }

            return $this->response(['message' => 'Invalid OTP'], 422);
        }

        $resetToken = Str::random(60);

        Cache::put($this->publicResetTokenKey($email), $resetToken, now()->addMinutes(15));
        Cache::forget($this->publicResetOtpKey($email));

        return $this->response([
            'message' => 'OTP verified successfully',
            'reset_token' => $resetToken,
        ]);
    }

    public function resetPublicPassword(string $email, string $resetToken, string $password): array
    {
        $validToken = Cache::get($this->publicResetTokenKey($email));

        if (! $validToken || $validToken !== $resetToken) {
            return $this->response(['message' => 'Invalid or expired reset session'], 403);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return $this->response(['message' => 'Account not found'], 404);
        }

        $user->password = Hash::make($password);
        $user->save();

        Cache::forget($this->publicResetTokenKey($email));

        Mail::raw('Your Dental Pro password was changed successfully.', function ($message) use ($user) {
            $message->to($user->email)->subject('Dental Pro password changed');
        });

        return $this->response(['message' => 'Password reset successfully']);
    }

    private function generateOtp(): string
    {
        return (string) rand(100000, 999999);
    }

    private function loginOtpKey(int $userId): string
    {
        return 'login_otp_'.$userId;
    }

    private function adminResetOtpKey(int $userId): string
    {
        return 'reset_otp_'.$userId;
    }

    private function publicResetOtpKey(string $email): string
    {
        return 'reset_otp_'.$email;
    }

    private function publicResetAttemptsKey(string $email): string
    {
        return 'reset_attempts_'.$email;
    }

    private function publicResetLockKey(string $email): string
    {
        return 'reset_lock_'.$email;
    }

    private function publicResetTokenKey(string $email): string
    {
        return 'allow_reset_'.$email;
    }

    private function response(array $data, int $status = 200): array
    {
        return ['data' => $data, 'status' => $status];
    }
}
