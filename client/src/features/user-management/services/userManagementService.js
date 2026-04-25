import {
  createUser,
  getAllRoles,
  getAuditHistory,
  getUsers,
  sendResetOtp,
  toggleUserStatus,
  updateUser,
  verifyAndResetPassword,
} from '@/api/userApi';

export const userManagementService = {
  async fetchUsers(params = {}) {
    const response = await getUsers(params);
    return response.data;
  },

  async fetchRoles() {
    const response = await getAllRoles();
    return response.data;
  },

  async fetchHistory() {
    const response = await getAuditHistory();
    return response.data;
  },

  async createUser(data) {
    const response = await createUser(data);
    return response.data;
  },

  async updateUser(id, data) {
    const response = await updateUser(id, data);
    return response.data;
  },

  async toggleUserStatus(id) {
    const response = await toggleUserStatus(id);
    return response.data;
  },

  async sendResetOtp(id) {
    const response = await sendResetOtp(id);
    return response.data;
  },

  async verifyAndResetPassword(id, otp, newPassword) {
    const response = await verifyAndResetPassword(id, otp, newPassword);
    return response.data;
  },
};
