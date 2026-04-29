import React, { useMemo } from 'react';
import { Eye, MoreHorizontal, SquarePen, RefreshCcw } from 'lucide-react';
import { PROFILE_ROLE_OPTIONS, PROFILE_STATUS_META } from '@/features/professional-profiles/utils';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Chưa hoàn thiện' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'inactive', label: 'Vô hiệu hoá' },
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const initialOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const buildPageItems = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
};

export default function ProfessionalProfileTable({
  profiles,
  loading,
  searchTerm,
  filterRole,
  filterStatus,
  filterStaffId,
  staffOptions = [],
  currentPage,
  totalPages,
  totalItems,
  perPage,
  selectedId,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onStaffChange,
  onRefresh,
  onView,
  onEdit,
  onOpenMenu,
  onPageChange,
  onPerPageChange,
}) {
  const roleStaffOptions = useMemo(() => {
    if (!filterRole || filterRole === 'all') return staffOptions;
    return staffOptions.filter((s) => s.role_slug === filterRole);
  }, [staffOptions, filterRole]);

  const filteredProfiles = useMemo(() => {
    if (!filterStaffId || filterStaffId === 'all') return profiles;
    return profiles.filter((p) => String(p.staff?.id || p.staff_id) === String(filterStaffId));
  }, [profiles, filterStaffId]);

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);
  const pageItems = buildPageItems(currentPage, totalPages || 1);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
      <div className="p-3 border-b border-slate-200 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-50/50">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-500">Loại nhân sự</label>
          <select
            value={filterRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tất cả</option>
            {PROFILE_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-500">Nhân sự</label>
          <select
            value={filterStaffId || 'all'}
            onChange={(e) => onStaffChange(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="all">Chọn nhân sự</option>
            {roleStaffOptions.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.full_name} ({staff.employee_code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-500">Trạng thái</label>
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 col-span-2 lg:col-span-1">
          <label className="text-[11px] text-slate-500">Chuyên môn / Chứng chỉ</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, mã NV, số chứng chỉ..."
            className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-500">Chi nhánh / Phòng</label>
          <select
            disabled
            title="Sắp ra mắt — BE chưa hỗ trợ"
            className="border border-slate-200 rounded px-2 py-1.5 text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            <option>Tất cả</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs bg-slate-50">
              <th className="py-2.5 px-3 font-medium w-12 text-center">STT</th>
              <th className="py-2.5 px-3 font-medium">Nhân sự</th>
              <th className="py-2.5 px-3 font-medium">Loại hồ sơ</th>
              <th className="py-2.5 px-3 font-medium">Chuyên môn / Mảng phụ trách</th>
              <th className="py-2.5 px-3 font-medium text-center">Trạng thái</th>
              <th className="py-2.5 px-3 font-medium">Ngày cập nhật</th>
              <th className="py-2.5 px-3 font-medium text-center w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {loading ? (
              <tr>
                <td colSpan={7} className="h-32 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="h-32 text-center text-slate-500">
                  Chưa có hồ sơ chuyên môn nào phù hợp
                </td>
              </tr>
            ) : (
              filteredProfiles.map((profile, index) => {
                const meta = PROFILE_STATUS_META[profile.status] || PROFILE_STATUS_META.draft;
                const isSelected = selectedId === profile.id;
                const specialtyText =
                  (profile.specialties || []).map((sp) => sp.specialty_name).filter(Boolean).join(', ') ||
                  (profile.profile_role === 'bac_si' ? 'Chưa cập nhật chuyên môn' : 'Nghiệp vụ chung');
                const lastChangeBy =
                  profile.approver?.name || profile.staff?.full_name || 'Hệ thống';

                return (
                  <tr
                    key={profile.id}
                    onClick={() => onView(profile)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-500">
                      {(currentPage - 1) * perPage + index + 1}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-600 overflow-hidden">
                          {profile.staff?.avatar ? (
                            <img
                              src={profile.staff.avatar}
                              alt={profile.staff.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initialOf(profile.staff?.full_name)
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{profile.staff?.full_name || '—'}</div>
                          <div className="text-[11px] text-slate-500">
                            {profile.profile_role === 'bac_si' ? 'Bác sĩ' : 'Kế toán'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {profile.profile_role === 'bac_si' ? 'Hồ sơ bác sĩ' : 'Hồ sơ kế toán'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 max-w-[220px] truncate" title={specialtyText}>
                      {specialtyText}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      <div>{formatDateTime(profile.updated_at)}</div>
                      <div className="text-[10px]">{lastChangeBy}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(profile);
                          }}
                          title="Xem chi tiết"
                          className="p-1 border border-slate-200 rounded hover:bg-white text-slate-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(profile);
                          }}
                          title="Chỉnh sửa"
                          className="p-1 border border-slate-200 rounded hover:bg-white text-slate-600"
                        >
                          <SquarePen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMenu?.(profile, e);
                          }}
                          title="Thao tác khác"
                          className="p-1 border border-slate-200 rounded hover:bg-white text-slate-600"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-2 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 text-slate-500 bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs">
            Hiển thị {totalItems > 0 ? `${start} - ${end}` : 0} trong tổng số {totalItems}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            title="Làm mới"
            className="p-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-500"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-7 h-7 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          {pageItems.map((item, i) =>
            item === '…' ? (
              <span key={`ell-${i}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`w-7 h-7 border rounded ${
                  item === currentPage
                    ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= (totalPages || 1)}
            className="w-7 h-7 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="ml-2 border border-slate-200 rounded py-1 px-1 focus:outline-none bg-white"
          >
            {PER_PAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / trang
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
