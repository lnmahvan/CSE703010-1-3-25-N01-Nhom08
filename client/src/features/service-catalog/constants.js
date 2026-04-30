export const SERVICE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  HIDDEN: 'hidden',
  DISCONTINUED: 'discontinued',
};

export const STATUS_LABELS = {
  [SERVICE_STATUS.DRAFT]: 'Nháp',
  [SERVICE_STATUS.ACTIVE]: 'Đang áp dụng',
  [SERVICE_STATUS.HIDDEN]: 'Tạm ẩn',
  [SERVICE_STATUS.DISCONTINUED]: 'Ngừng áp dụng',
};

export const STATUS_BADGE_CLASS = {
  [SERVICE_STATUS.DRAFT]: 'bg-slate-100 text-slate-600 border-slate-200',
  [SERVICE_STATUS.ACTIVE]: 'bg-green-100 text-green-700 border-green-200',
  [SERVICE_STATUS.HIDDEN]: 'bg-orange-100 text-orange-700 border-orange-200',
  [SERVICE_STATUS.DISCONTINUED]: 'bg-red-100 text-red-700 border-red-200',
};

export const VISIBILITY = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
};

export const VISIBILITY_LABELS = {
  [VISIBILITY.PUBLIC]: 'Công khai',
  [VISIBILITY.INTERNAL]: 'Nội bộ',
};

export const ATTACHMENT_TYPE = {
  IMAGE: 'image',
  DOCUMENT: 'document',
};

export const ATTACHMENT_TYPE_LABELS = {
  [ATTACHMENT_TYPE.IMAGE]: 'Hình ảnh',
  [ATTACHMENT_TYPE.DOCUMENT]: 'Tài liệu',
};

export const FORM_STEPS = [
  { id: 1, label: 'Thông tin chung' },
  { id: 2, label: 'Giá & Thời lượng' },
  { id: 3, label: 'Chuyên môn' },
  { id: 4, label: 'Hình ảnh & Tài liệu' },
  { id: 5, label: 'Phạm vi & Xác nhận' },
];

export const DETAIL_TABS = [
  { id: 'general', label: 'Thông tin chung' },
  { id: 'pricing', label: 'Giá dịch vụ' },
  { id: 'specialty', label: 'Chuyên môn yêu cầu' },
  { id: 'attachments', label: 'Hình ảnh & tài liệu' },
  { id: 'history', label: 'Lịch sử thay đổi' },
];
