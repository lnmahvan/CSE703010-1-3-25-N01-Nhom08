import axiosClient from './axiosClient';

// Lấy danh sách người dùng (phân trang + tìm kiếm + lọc)
export const getUsers = (params = {}) => {
  return axiosClient.get('/users', { params });
};

// Tạo tài khoản mới
export const createUser = (data) => {
  return axiosClient.post('/users', data);
};

// Cập nhật thông tin tài khoản
export const updateUser = (id, data) => {
  return axiosClient.put(`/users/${id}`, data);
};

// Khóa / Mở khóa tài khoản
export const toggleUserStatus = (id) => {
  return axiosClient.put(`/users/${id}/toggle-status`);
};

// Gửi OTP đặt lại mật khẩu (Bước 1)
export const sendResetOtp = (id) => {
  return axiosClient.post(`/users/${id}/send-reset-otp`);
};

// Xác thực OTP và đặt mật khẩu mới (Bước 2+3)
export const verifyAndResetPassword = (id, otp, new_password) => {
  return axiosClient.post(`/users/${id}/verify-reset`, { otp, new_password });
};

// Lấy danh sách tất cả Vai trò từ bảng roles
export const getAllRoles = () => {
  return axiosClient.get('/roles');
};

// Lấy lịch sử thay đổi (AuditLog)
export const getAuditHistory = () => {
  return axiosClient.get('/users/history');
};
