import axiosClient from './axiosClient';

const professionalProfileApi = {
  getAll: (params) => axiosClient.get('/professional-profiles', { params }),
  getOptions: () => axiosClient.get('/professional-profiles/options'),
  getById: (id) => axiosClient.get(`/professional-profiles/${id}`),
  create: (data) => axiosClient.post('/professional-profiles', data),
  update: (id, data) => axiosClient.post(`/professional-profiles/${id}`, data),
  submit: (id) => axiosClient.post(`/professional-profiles/${id}/submit`),
  approve: (id) => axiosClient.post(`/professional-profiles/${id}/approve`),
  reject: (id, reason) => axiosClient.post(`/professional-profiles/${id}/reject`, { reason }),
  invalidate: (id) => axiosClient.post(`/professional-profiles/${id}/invalidate`),
  getHistory: (id) => axiosClient.get(`/professional-profiles/${id}/history`),
  getMine: () => axiosClient.get('/my-professional-profile'),
  updateMine: (id, data) => axiosClient.put(`/my-professional-profile/${id}`, data),
  submitMine: (id) => axiosClient.post(`/my-professional-profile/${id}/submit`),
};

export default professionalProfileApi;
