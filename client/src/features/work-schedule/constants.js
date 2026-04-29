export const SHIFT_COLORS = {
  morning: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-400' },
  afternoon: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' },
  evening: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  custom: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
  off: { bg: 'bg-gray-50', text: 'text-gray-400', dot: 'bg-gray-300' },
};

export const SCHEDULE_STATUS_LABEL = {
  scheduled: 'Đã lên lịch',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã hoàn thành',
  swapped: 'Đã đổi ca',
};

export const SCHEDULE_STATUS_BADGE = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  swapped: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const REQUEST_STATUS_LABEL = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

export const REQUEST_STATUS_BADGE = {
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const ROLE_LABEL = {
  admin: 'Quản trị viên',
  bac_si: 'Bác sĩ',
  le_tan: 'Lễ tân',
  ke_toan: 'Kế toán',
  benh_nhan: 'Bệnh nhân',
};

// Work-role used inside a single shift (E4 - doctor specialty matching).
export const WORK_ROLE_OPTIONS = [
  { value: 'doctor_treatment', label: 'Bác sĩ điều trị', roles: ['bac_si'] },
  { value: 'doctor_consult', label: 'Bác sĩ tư vấn', roles: ['bac_si'] },
  { value: 'doctor_surgery', label: 'Bác sĩ phẫu thuật', roles: ['bac_si'] },
  { value: 'reception', label: 'Lễ tân', roles: ['le_tan'] },
  { value: 'accountant', label: 'Kế toán', roles: ['ke_toan'] },
  { value: 'support', label: 'Hỗ trợ', roles: ['le_tan', 'ke_toan'] },
];

export const WEEKDAY_LABEL = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
