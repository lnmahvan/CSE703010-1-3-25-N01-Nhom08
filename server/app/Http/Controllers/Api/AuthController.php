<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Role;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // 1. ĐĂNG NHẬP THƯỜNG (Vẫn giữ nguyên bắt buộc OTP mỗi lần đăng nhập)
    public function login(Request $request) {
        $loginData = $request->input('email'); 
        $password = $request->input('password');

        $user = User::where('email', $loginData)->orWhere('phone', $loginData)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Tài khoản không tồn tại'], 404);
        }

        if ($user->status === 'locked') {
            return response()->json(['message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên'], 403);
        }

        if (!Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Sai mật khẩu, vui lòng nhập lại'], 401);
        }

        // Sinh mã OTP
        $otp = rand(100000, 999999);
        Cache::put('login_otp_' . $user->id, $otp, now()->addMinutes(5));

        // Gửi mail
        Mail::raw("Mã xác minh đăng nhập Dental Pro của bạn là: $otp", function($message) use ($user) {
            $message->to($user->email)->subject('Mã xác minh đăng nhập');
        });

        return response()->json([
            'requires_otp' => true, 
            'user_id' => $user->id,
            'email' => $user->email
        ]);
    }

    // 2. ĐĂNG NHẬP GOOGLE 
    public function googleLogin(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->access_token);
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // TRƯỜNG HỢP 1: TÀI KHOẢN ĐÃ TỒN TẠI
                if ($user->status === 'locked') {
                    return response()->json(['message' => 'Tài khoản đã bị khóa!'], 403);
                }

                $token = $user->createToken('DentalProToken')->plainTextToken;
                $user->load('roles');

                return response()->json([
                    'requires_otp' => false,
                    'message'      => 'Đăng nhập thành công',
                    'token'        => $token,
                    'user'         => array_merge($user->toArray(), [
                        'role' => $user->roles->first()?->slug ?? ''
                    ])
                ]);

            } else {
                // TRƯỜNG HỢP 2: TÀI KHOẢN CHƯA TỒN TẠI -> TẠO MỚI

                // 1. Tự động sinh username từ email
                $baseUsername = explode('@', $googleUser->getEmail())[0];
                $username = $baseUsername . '_' . rand(1000, 9999);

                // 2. Tạo user — KHÔNG có cột 'role' (đã bị drop, dùng bảng roles)
                $user = User::create([
                    'name'      => $googleUser->getName(),
                    'username'  => $username,
                    'email'     => $googleUser->getEmail(),
                    'password'  => Hash::make(Str::random(16)),
                    'status'    => 'active',
                    'google_id' => $googleUser->getId()
                ]);

                // 3. Gắn vai trò 'benh_nhan' vào bảng pivot role_user
                $benhNhanRole = Role::where('slug', 'benh_nhan')->first();
                if ($benhNhanRole) {
                    $user->roles()->attach($benhNhanRole->id);
                }

                // 4. Sinh mã OTP xác thực lần đầu
                $otp = rand(100000, 999999);
                Cache::put('login_otp_' . $user->id, $otp, now()->addMinutes(5));

                Mail::raw("Mã xác minh Google Login Dental Pro của bạn là: $otp", function($message) use ($user) {
                    $message->to($user->email)->subject('Xác minh Đăng nhập Google lần đầu');
                });

                return response()->json([
                    'requires_otp' => true,
                    'user_id'      => $user->id,
                    'email'        => $user->email,
                    'message'      => 'Vui lòng kiểm tra email để lấy mã xác nhận'
                ]);
            }

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi xác thực Google, vui lòng thử lại sau.',
                'error' => $e->getMessage()
            ], 401);
        }
    }

    // 3. XÁC NHẬN MÃ OTP (Chìa khóa cuối cùng)
    public function verifyLoginOtp(Request $request) 
    {
        $request->validate([
            'user_id' => 'required',
            'otp' => 'required'
        ]);

        $cachedOtp = Cache::get('login_otp_' . $request->user_id);

        if ($cachedOtp && $cachedOtp == $request->otp) {
            Cache::forget('login_otp_' . $request->user_id);
            $user = User::with('roles')->find($request->user_id);

            // Cấp token chính thức
            $token = $user->createToken('DentalProToken')->plainTextToken;

            return response()->json([
                'message' => "Chào mừng {$user->name} quay trở lại",
                'token'   => $token,
                'user'    => array_merge($user->toArray(), [
                    'role' => $user->roles->first()?->slug ?? ''
                ])
            ], 200);
        }

        return response()->json(['message' => 'Mã xác minh không đúng hoặc đã hết hạn!'], 422);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công'], 200);
    }
}