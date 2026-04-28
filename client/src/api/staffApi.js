import axiosClient from './axiosClient';

export const staffApi = {
  getAll: (params) => {
    return axiosClient.get('/staff', { params });
  },

  getById: (id) => {
    return axiosClient.get(`/staff/${id}`);
  },

  create: (data) => {
    return axiosClient.post('/staff', data);
  },

  update: (id, data) => {
    return axiosClient.put(`/staff/${id}`, data);
  },

  changeStatus: (id, status) => {
    return axiosClient.put(`/staff/${id}/status`, { status });
  },

  getHistory: (id) => {
    return axiosClient.get(`/staff/${id}/history`);
  },

  resetPassword: (id) => {
    return axiosClient.post(`/staff/${id}/reset-password`);
  },
};
