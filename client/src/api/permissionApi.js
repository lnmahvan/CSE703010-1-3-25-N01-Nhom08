import axiosClient from './axiosClient';

const permissionApi = {
  // Lấy toàn bộ danh sách quyền nhóm theo module
  getAllPermissions: () => {
    return axiosClient.get('/permissions');
  },

  // Lấy quyền của một vai trò cụ thể
  getRolePermissions: (roleId) => {
    return axiosClient.get(`/roles/${roleId}/permissions`);
  },

  // Cập nhật quyền cho vai trò
  updateRolePermissions: (roleId, permissionIds) => {
    return axiosClient.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds });
  },

  // Lấy quyền riêng của một tài khoản
  getUserPermissions: (userId) => {
    return axiosClient.get(`/users/${userId}/permissions`);
  },

  // Cập nhật quyền riêng cho tài khoản
  updateUserPermissions: (userId, permissionIds) => {
    return axiosClient.put(`/users/${userId}/permissions`, { permission_ids: permissionIds });
  }
};

export default permissionApi;
