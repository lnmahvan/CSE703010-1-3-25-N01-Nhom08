import axiosClient from './axiosClient';

// Đăng nhập bằng Email/Password
export const login = (email, password) => {
  return axiosClient.post('/login', { email, password });
};

// Đăng nhập bằng Google OAuth
export const googleLogin = (access_token) => {
  return axiosClient.post('/auth/google', { access_token });
};

// Xác minh OTP đăng nhập
export const verifyLoginOtp = (user_id, otp) => {
  return axiosClient.post('/verify-login-otp', { user_id, otp });
};

// Đăng xuất
export const logout = () => {
  return axiosClient.post('/logout');
};

// Quên mật khẩu — Gửi OTP
export const sendResetOtp = (email) => {
  return axiosClient.post('/password/forgot/send-otp', { email });
};

// Quên mật khẩu — Xác thực OTP
export const verifyResetOtp = (email, otp) => {
  return axiosClient.post('/password/forgot/verify-otp', { email, otp });
};

// Quên mật khẩu — Đặt lại mật khẩu
export const resetPassword = (email, reset_token, password, password_confirmation) => {
  return axiosClient.post('/password/forgot/reset', {
    email, reset_token, password, password_confirmation,
  });
};
