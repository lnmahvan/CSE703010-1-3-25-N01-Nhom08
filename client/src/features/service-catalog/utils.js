import { STATUS_LABELS, VISIBILITY_LABELS } from './constants';

export const formatVnd = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
};

export const formatDateTime = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return String(value);
  }
};

export const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch {
    return String(value);
  }
};

export const statusLabel = (s) => STATUS_LABELS[s] || s;
export const visibilityLabel = (v) => VISIBILITY_LABELS[v] || v;

export const formatBytes = (bytes) => {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export const buildEmptyForm = () => ({
  service_code: '',
  service_group_id: '',
  name: '',
  description: '',
  price: '',
  duration_minutes: '',
  commission_rate: '',
  status: 'draft',
  visibility: 'internal',
  notes: '',
  specialty_ids: [],
  primary_specialty_id: '',
});

export const toFormState = (service) => ({
  service_code: service?.service_code || '',
  service_group_id: service?.service_group_id || '',
  name: service?.name || '',
  description: service?.description || '',
  price: service?.price ?? '',
  duration_minutes: service?.duration_minutes ?? '',
  commission_rate: service?.commission_rate ?? '',
  status: service?.status || 'draft',
  visibility: service?.visibility || 'internal',
  notes: service?.notes || '',
  specialty_ids: (service?.specialties || []).map((s) => s.id),
  primary_specialty_id:
    (service?.specialties || []).find((s) => s.pivot?.is_primary)?.id || '',
});
