import React from 'react';
import { Search, Eye, Pencil, RefreshCw, Lock, Unlock, History, X } from 'lucide-react';

const STATUS_BADGE = {
  working: 'bg-green-100 text-green-700 border-green-200',
  suspended: 'bg-orange-100 text-orange-700 border-orange-200',
  resigned: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABEL = {
  working: 'Đang làm việc',
  suspended: 'Tạm nghỉ',
  resigned: 'Nghỉ việc',
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const initialOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();

/**
 * Compute compact pagination range with leading/trailing windows around current page.
 * Returns array of numbers and '…' separators.
 */
const buildPageRange = (current, last) => {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const range = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...range].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…');
    out.push(sorted[i]);
  }
  return out;
};

const StaffTable = ({
  staffList,
  availableRoles,
  loading,
  currentPage,
  totalPages,
  totalCount,
  perPage = 10,
  pageSizeOptions = [10, 25, 50, 100],
  searchTerm,
  filterRoleId,
  filterStatus,
  joinDateFrom,
  selectedStaffId,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onJoinDateFromChange,
  onPerPageChange,
  onSelectStaff,
  onOpenHistory,
  onEdit,
  onToggleStatus,
  onPageChange,
  onResetFilters,
}) => {
  const total = totalCount ?? staffList?.length ?? 0;
  const pageStart = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const pageEnd = total === 0 ? 0 : Math.min(currentPage * perPage, pageStart + (staffList?.length ?? 0) - 1);

  const goPage = (p) => {
    if (typeof p !== 'number') return;
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange(p);
  };

  const pageRange = buildPageRange(currentPage, Math.max(totalPages, 1));
  const getRoleLabel = (slug) =>
    availableRoles?.find((r) => r.slug === slug)?.name || slug || '—';

  const hasActiveFilter =
    !!searchTerm ||
    filterRoleId !== 'all' ||
    filterStatus !== 'all' ||
    !!joinDateFrom;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã NV, Tên, Email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={filterRoleId}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className="w-40 border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Vai trò: Tất cả</option>
          {availableRoles?.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="w-44 border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Trạng thái: Tất cả</option>
          <option value="working">Đang làm việc</option>
          <option value="suspended">Tạm nghỉ</option>
          <option value="resigned">Nghỉ việc</option>
        </select>

        <input
          type="date"
          value={joinDateFrom || ''}
          onChange={(e) => onJoinDateFromChange?.(e.target.value)}
          title="Vào làm từ ngày"
          className="w-44 border border-slate-300 rounded-md px-3 py-2 text-sm bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={() => onPageChange(1)}
          className="px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 text-sm flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>

        {hasActiveFilter && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" /> Xoá lọc
          </button>
        )}
      </div>

      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center text-sm text-slate-500">
        <span>Tổng {total} nhân sự</span>
        {hasActiveFilter && <span className="text-xs italic">Đang áp dụng bộ lọc</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-3 px-4 font-medium w-12">STT</th>
              <th className="py-3 px-4 font-medium">Mã NV</th>
              <th className="py-3 px-4 font-medium">Họ và tên</th>
              <th className="py-3 px-4 font-medium">Vai trò</th>
              <th className="py-3 px-4 font-medium">Số điện thoại</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Trạng thái</th>
              <th className="py-3 px-4 font-medium">Ngày vào làm</th>
              <th className="py-3 px-4 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  Không tìm thấy hồ sơ nào
                </td>
              </tr>
            ) : (
              staffList.map((staff, index) => {
                const isSelected = selectedStaffId === staff.id;
                return (
                  <tr
                    key={staff.id}
                    onClick={() => onSelectStaff?.(staff)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-700">
                      {(currentPage - 1) * perPage + index + 1}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{staff.employee_code}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 overflow-hidden flex-shrink-0">
                          {staff.avatar ? (
                            <img
                              src={staff.avatar}
                              alt={staff.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initialOf(staff.full_name)
                          )}
                        </div>
                        <span>{staff.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{getRoleLabel(staff.role_slug)}</td>
                    <td className="py-3 px-4 text-slate-700">{staff.phone || '—'}</td>
                    <td className="py-3 px-4 text-slate-700">{staff.email || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${
                          STATUS_BADGE[staff.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {STATUS_LABEL[staff.status] || staff.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(staff.join_date)}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStaff?.(staff);
                          }}
                          title="Xem chi tiết"
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500 hover:text-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(staff);
                          }}
                          title="Chỉnh sửa"
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus(staff.id, staff.status);
                          }}
                          title={staff.status === 'working' ? 'Cho tạm nghỉ' : 'Đi làm lại'}
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500 hover:text-amber-600"
                        >
                          {staff.status === 'working' ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenHistory(staff);
                          }}
                          title="Lịch sử"
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500 hover:text-slate-700"
                        >
                          <History className="h-4 w-4" />
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

      <div className="px-4 py-3 border-t border-slate-200 flex flex-wrap gap-3 justify-between items-center bg-slate-50 rounded-b-lg text-sm">
        <span className="text-slate-500">
          {total === 0
            ? 'Không có dữ liệu'
            : `Hiển thị ${pageStart} - ${pageEnd} trong tổng số ${total}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded bg-white text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          {pageRange.map((p, i) =>
            p === '…' ? (
              <span
                key={`gap-${i}`}
                className="w-8 h-8 flex items-center justify-center text-slate-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goPage(p)}
                className={`w-8 h-8 flex items-center justify-center border rounded font-medium ${
                  p === currentPage
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => goPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded bg-white text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
          {onPerPageChange && (
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="ml-2 border border-slate-200 rounded py-1.5 px-2 bg-white text-slate-700 focus:outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffTable;
