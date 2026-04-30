import axiosClient from './axiosClient';

export const serviceCatalogApi = {
  list: (params) => axiosClient.get('/services', { params }),
  get: (id) => axiosClient.get(`/services/${id}`),
  create: (data) => axiosClient.post('/services', data),
  update: (id, data) => axiosClient.put(`/services/${id}`, data),
  changeStatus: (id, payload) => axiosClient.post(`/services/${id}/status`, payload),
  remove: (id) => axiosClient.delete(`/services/${id}`),
  groups: () => axiosClient.get('/services/groups'),
  specialties: () => axiosClient.get('/services/specialties'),
  attachments: (id) => axiosClient.get(`/services/${id}/attachments`),
  uploadAttachment: (id, formData) =>
    axiosClient.post(`/services/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAttachment: (id, attachmentId) =>
    axiosClient.delete(`/services/${id}/attachments/${attachmentId}`),
  auditLogs: () => axiosClient.get('/services/audit-logs'),
};
