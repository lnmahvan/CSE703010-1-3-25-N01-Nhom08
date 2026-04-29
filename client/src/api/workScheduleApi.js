import axiosClient from './axiosClient';

const workScheduleApi = {
  list: (params = {}) => axiosClient.get('/work-schedules', { params }),
  show: (id) => axiosClient.get(`/work-schedules/${id}`),
  create: (data) => axiosClient.post('/work-schedules', data),
  update: (id, data) => axiosClient.put(`/work-schedules/${id}`, data),
  cancel: (id, cancel_reason) =>
    axiosClient.delete(`/work-schedules/${id}`, { data: { cancel_reason } }),
  copyWeek: (data) => axiosClient.post('/work-schedules/copy', data),
  templates: () => axiosClient.get('/work-shift-templates'),
  branchStats: (params) => axiosClient.get('/work-schedules/branch-stats', { params }),
  auditLogs: (params = {}) => axiosClient.get('/work-schedules/audit-logs', { params }),

  myWorkSchedule: (params = {}) => axiosClient.get('/my-work-schedule', { params }),

  listLeaveRequests: (params = {}) => axiosClient.get('/leave-requests', { params }),
  createLeaveRequest: (data) => axiosClient.post('/leave-requests', data),
  approveLeaveRequest: (id, review_note) =>
    axiosClient.post(`/leave-requests/${id}/approve`, { review_note }),
  rejectLeaveRequest: (id, review_note) =>
    axiosClient.post(`/leave-requests/${id}/reject`, { review_note }),

  listSwapRequests: (params = {}) => axiosClient.get('/shift-swap-requests', { params }),
  createSwapRequest: (data) => axiosClient.post('/shift-swap-requests', data),
  approveSwapRequest: (id, review_note) =>
    axiosClient.post(`/shift-swap-requests/${id}/approve`, { review_note }),
  rejectSwapRequest: (id, review_note) =>
    axiosClient.post(`/shift-swap-requests/${id}/reject`, { review_note }),
};

export default workScheduleApi;
