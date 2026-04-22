import axiosClient from './axiosClient';

// Lấy thống kê tổng quan cho Admin Dashboard
export const getAdminStats = () => {
  return axiosClient.get('/admin/dashboard-stats');
};
