<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller
{
    // BƯỚC 1: Gửi mã OTP (Ngoại lệ E1, E2)
    public function sendResetOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();

        // E1: Không tồn tại tài khoản
        if (!$user) {
            return response()->json(['message' => 'Không tồn tại tài khoản tương ứng.'], 404);
        }

        // E2: Tài khoản Google (Giả định bạn có trường google_id hoặc auth_provider để nhận biết)
        // Nếu database của bạn chưa có trường này, bạn có thể tạm bỏ qua khối lệnh này
        // if ($user->auth_provider === 'google') {
        //     return response()->json(['message' => 'Tài khoản này sử dụng đăng nhập Google, không thể khôi phục mật khẩu.'], 403);
        // }

        // Kiểm tra xem user có đang bị khóa 3 giờ do nhập sai quá 5 lần không (E5)
        if (Cache::has('reset_lock_' . $user->email)) {
            return response()->json(['message' => 'Chức năng khôi phục đã bị khóa 3 giờ do nhập sai quá nhiều lần.'], 429);
        }

        // Tạo và lưu OTP 5 phút
        $otp = rand(100000, 999999);
        Cache::put('reset_otp_' . $user->email, $otp, now()->addMinutes(5));
        
        // Reset lại số lần nhập sai khi gửi OTP mới
        Cache::forget('reset_attempts_' . $user->email);

        // Gửi Mail
        try {
            Mail::raw("Mã OTP khôi phục mật khẩu Dental Pro của bạn là: $otp. Mã có hiệu lực trong 5 phút.", function($message) use ($user) {
                $message->to($user->email)->subject('Khôi phục mật khẩu');
            });
        } catch (\Exception $e) {
            // E8: Không gửi được email
            return response()->json(['message' => 'Không thể gửi mã xác thực, vui lòng thử lại sau.'], 500);
        }

        return response()->json(['message' => 'Mã xác thực đã được gửi đến email của bạn.']);
    }

    // BƯỚC 2: Xác nhận mã OTP (Ngoại lệ E3, E4, E5)
    public function verifyResetOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string'
        ]);

        $email = $request->email;

        // E4: OTP hết hạn hoặc không tồn tại
        if (!Cache::has('reset_otp_' . $email)) {
            return response()->json(['message' => 'Mã xác thực đã hết hạn, vui lòng gửi lại.'], 422);
        }

        $cachedOtp = Cache::get('reset_otp_' . $email);

        if ($cachedOtp != $request->otp) {
            // Tăng số lần nhập sai
            $attempts = Cache::increment('reset_attempts_' . $email);
            
            // E5: Nhập sai quá 5 lần -> Khóa 3 giờ
            if ($attempts >= 5) {
                Cache::forget('reset_otp_' . $email);
                Cache::forget('reset_attempts_' . $email);
                Cache::put('reset_lock_' . $email, true, now()->addHours(3));
                return response()->json(['message' => 'Bạn đã nhập sai quá 5 lần. Chức năng khôi phục bị khóa trong 3 giờ.'], 429);
            }

            // E3: Mã không chính xác (nhưng chưa quá 5 lần)
            return response()->json(['message' => 'Mã OTP không chính xác. Bạn còn ' . (5 - $attempts) . ' lần thử.'], 422);
        }

        // OTP hợp lệ -> Tạo một token tạm thời cho phép đổi mật khẩu (Valid 15 phút)
        $resetToken = \Str::random(60);
        Cache::put('allow_reset_' . $email, $resetToken, now()->addMinutes(15));
        Cache::forget('reset_otp_' . $email); // Hủy OTP cũ

        return response()->json([
            'message' => 'Xác thực thành công.',
            'reset_token' => $resetToken
        ]);
    }

    // BƯỚC 3: Đặt lại mật khẩu (Ngoại lệ E6, E7)
    public function resetPassword(Request $request)
    {
        // E6, E7 được xử lý ngay trong khối validate này
        $request->validate([
            'email' => 'required|email',
            'reset_token' => 'required',
            'password' => [
                'required',
                'confirmed', // Bắt buộc trường password_confirmation phải khớp (E6)
                Password::min(8)->letters()->mixedCase()->numbers()->symbols() // Format (E7)
            ]
        ], [
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'
        ]);

        $email = $request->email;

        // Kiểm tra quyền đổi mật khẩu
        $validToken = Cache::get('allow_reset_' . $email);
        if (!$validToken || $validToken !== $request->reset_token) {
            return response()->json(['message' => 'Phiên làm việc không hợp lệ hoặc đã hết hạn.'], 403);
        }

        // Cập nhật mật khẩu
        $user = User::where('email', $email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Xóa token cấp phép
        Cache::forget('allow_reset_' . $email);

        // Gửi email thông báo đổi mật khẩu thành công
        Mail::raw("Mật khẩu tài khoản Dental Pro của bạn vừa được thay đổi thành công.", function($message) use ($user) {
            $message->to($user->email)->subject('Đổi mật khẩu thành công');
        });

        return response()->json(['message' => 'Đổi mật khẩu thành công, vui lòng đăng nhập lại.']);
    }
}