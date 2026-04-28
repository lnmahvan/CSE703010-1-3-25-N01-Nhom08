import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Download,
  Upload,
  Pencil,
  RefreshCw,
  Eye,
  ShieldCheck,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  FileSpreadsheet,
  Lock,
  X,
  KeyRound,
  Camera,
  PanelRightOpen,
} from 'lucide-react';
import { useStaffManagement } from '@/features/staff-management/hooks/useStaffManagement';
import StaffTable from '@/features/staff-management/components/StaffTable';
import StaffFormModal from '@/features/staff-management/components/StaffFormModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

const GENDER_LABEL = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

const SALARY_TYPE_LABEL = {
  hourly: 'Theo giờ',
  monthly: 'Theo tháng',
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
};

const ACCOUNT_STATUS_BADGE = {
  active: { className: 'bg-green-100 text-green-700 border-green-200', label: 'Đang hoạt động' },
  locked: { className: 'bg-red-100 text-red-700 border-red-200', label: 'Đã khóa' },
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
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

export default function StaffManagement() {
  const navigate = useNavigate();
  const {
    staffList,
    availableRoles,
    loading,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    pageSizeOptions,
    searchTerm,
    filterRoleId,
    filterStatus,
    joinDateFrom,
    showModal,
    isEditing,
    formData,
    showHistoryModal,
    historyLogs,
    setSearchTerm,
    setFilterRoleId,
    setFilterStatus,
    setJoinDateFrom,
    setPerPage,
    setFormData,
    openCreateModal,
    openEditModal,
    closeFormModal,
    loadHistory,
    openHistoryModal,
    closeHistoryModal,
    loadStaff,
    handleToggleStatus,
    handleResetPassword,
    handleSubmit,
  } = useStaffManagement();

  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [detailTab, setDetailTab] = useState('general');

  const selectedStaff = useMemo(() => {
    if (selectedStaffId == null) return null;
    return staffList.find((s) => s.id === selectedStaffId) || null;
  }, [selectedStaffId, staffList]);

  const lockedCount = useMemo(
    () => staffList.filter((s) => s.status !== 'working').length,
    [staffList]
  );

  const lastAuditLog = historyLogs[0] || null;

  const handleSelectStaff = (staff) => {
    setSelectedStaffId(staff.id);
    if (staff.id) {
      loadHistory(staff.id);
    }
  };

  const handleClosePanel = () => {
    setSelectedStaffId(null);
  };

  const handleOpenFullHistory = (staff) => {
    if (!staff) return;
    setSelectedStaffId(staff.id);
    loadHistory(staff.id).then(() => openHistoryModal());
  };

  const handleQuickToggleStatus = () => {
    if (!selectedStaff) return;
    handleToggleStatus(selectedStaff.id, selectedStaff.status);
  };

  const handleViewProfessionalProfile = () => {
    if (!selectedStaff) return;
    navigate(`/professional-profiles?staff=${selectedStaff.id}`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterRoleId('all');
    setFilterStatus('all');
    setJoinDateFrom('');
  };

  const roleLabel = (slug) =>
    availableRoles.find((r) => r.slug === slug)?.name || slug || '—';

  const accountBadge = selectedStaff?.user
    ? ACCOUNT_STATUS_BADGE[selectedStaff.user.status] || {
        className: 'bg-slate-100 text-slate-700 border-slate-200',
        label: selectedStaff.user.status || '—',
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản lý hồ sơ nhân sự</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý thông tin nhân sự và tài khoản liên kết trong hệ thống
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            title="Sắp ra mắt"
            className="px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-500 hover:bg-slate-50 font-medium flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" /> Xuất Excel
          </button>
          <button
            type="button"
            disabled
            title="Sắp ra mắt"
            className="px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-500 hover:bg-slate-50 font-medium flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" /> Nhập Excel
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm text-sm"
          >
            <Plus className="h-4 w-4" /> Thêm nhân sự
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <StaffTable
            staffList={staffList}
            availableRoles={availableRoles}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalItems}
            perPage={perPage}
            pageSizeOptions={pageSizeOptions}
            searchTerm={searchTerm}
            filterRoleId={filterRoleId}
            filterStatus={filterStatus}
            joinDateFrom={joinDateFrom}
            selectedStaffId={selectedStaffId}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setFilterRoleId}
            onStatusFilterChange={setFilterStatus}
            onJoinDateFromChange={setJoinDateFrom}
            onPerPageChange={setPerPage}
            onResetFilters={handleResetFilters}
            onSelectStaff={handleSelectStaff}
            onOpenHistory={handleOpenFullHistory}
            onEdit={openEditModal}
            onToggleStatus={handleToggleStatus}
            onPageChange={loadStaff}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Lịch sử thay đổi (Audit Log)</h3>
                {selectedStaff && historyLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={openHistoryModal}
                    className="text-blue-600 text-xs font-medium hover:underline"
                  >
                    Xem tất cả
                  </button>
                )}
              </div>
              {!selectedStaff ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Chọn một nhân sự ở bảng phía trên để xem lịch sử thao tác.
                </p>
              ) : historyLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Chưa có lịch sử cho nhân sự này.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-200">
                        <th className="pb-2 font-medium">Thời gian</th>
                        <th className="pb-2 font-medium">Người thao tác</th>
                        <th className="pb-2 font-medium">Hành động</th>
                        <th className="pb-2 font-medium">Nội dung thay đổi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyLogs.slice(0, 5).map((log, index) => (
                        <tr key={log.id ?? index} className="border-b border-slate-100">
                          <td className="py-2 text-slate-500 whitespace-nowrap">
                            {formatDateTime(log.created_at || log.timestamp)}
                          </td>
                          <td className="py-2 text-slate-700 whitespace-nowrap">
                            {log.admin_name || log.actor_name || '—'}
                          </td>
                          <td className="py-2 text-slate-700">
                            {log.action || '—'}
                          </td>
                          <td className="py-2 text-slate-600 max-w-[180px] truncate" title={log.action}>
                            {log.action || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-slate-800 mb-4">Thao tác nhanh</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex flex-col items-center justify-center border border-slate-200 rounded-lg p-3 hover:bg-slate-50 gap-2"
                >
                  <UserPlus className="h-6 w-6 text-slate-600" />
                  <span className="text-xs text-center text-slate-700">Thêm nhân sự</span>
                </button>
                <button
                  type="button"
                  disabled
                  title="Sắp ra mắt"
                  className="flex flex-col items-center justify-center border border-slate-200 rounded-lg p-3 hover:bg-slate-50 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="h-6 w-6 text-slate-600" />
                  <span className="text-xs text-center text-slate-700">Nhập Excel</span>
                </button>
                <button
                  type="button"
                  disabled
                  title="Sắp ra mắt"
                  className="flex flex-col items-center justify-center border border-slate-200 rounded-lg p-3 hover:bg-slate-50 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-6 w-6 text-slate-600" />
                  <span className="text-xs text-center text-slate-700">Xuất Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickToggleStatus}
                  disabled={!selectedStaff}
                  title={
                    selectedStaff
                      ? `Chuyển trạng thái: ${selectedStaff.full_name}`
                      : 'Chọn một nhân sự ở bảng để chuyển trạng thái'
                  }
                  className="flex flex-col items-center justify-center border border-slate-200 rounded-lg p-3 hover:bg-slate-50 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="h-6 w-6 text-slate-600" />
                  <span className="text-xs text-center text-slate-700">Chuyển trạng thái</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('suspended')}
                  className="flex flex-col items-center justify-center border border-slate-200 rounded-lg p-3 hover:bg-slate-50 gap-2 relative"
                >
                  {lockedCount > 0 && (
                    <span className="absolute top-2 right-2 min-w-4 h-4 px-1 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                      {lockedCount}
                    </span>
                  )}
                  <Lock className="h-6 w-6 text-red-500" />
                  <span className="text-xs text-center text-slate-700">Xem bị khóa</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedStaff ? (
          <aside className="w-full xl:w-[400px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-shrink-0">
            <div className="px-5 py-4 flex justify-between items-center border-b border-slate-200">
              <h2 className="font-semibold text-slate-800 text-lg">Chi tiết nhân sự</h2>
              <button
                type="button"
                onClick={handleClosePanel}
                title="Đóng panel"
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex gap-4 items-start mb-6">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-semibold text-slate-600 overflow-hidden">
                  {selectedStaff.avatar ? (
                    <img
                      src={selectedStaff.avatar}
                      alt={selectedStaff.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initialOf(selectedStaff.full_name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-slate-500 text-xs mb-1">{selectedStaff.employee_code}</div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        STATUS_BADGE[selectedStaff.status] ||
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {STATUS_LABEL[selectedStaff.status] || selectedStaff.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">
                    {selectedStaff.full_name}
                  </h3>
                  <p className="text-slate-600 mb-2 text-sm">{roleLabel(selectedStaff.role_slug)}</p>
                  <div className="text-[11px] text-slate-500 flex flex-col gap-0.5">
                    <p>Vào làm: {formatDate(selectedStaff.join_date)}</p>
                    <p>
                      Cập nhật lần cuối:{' '}
                      {lastAuditLog
                        ? `${lastAuditLog.admin_name || '—'} · ${formatDateTime(
                            lastAuditLog.created_at
                          )}`
                        : formatDateTime(selectedStaff.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
                {[
                  { id: 'general', label: 'Thông tin chung' },
                  { id: 'qualification', label: 'Thông tin chuyên môn' },
                  { id: 'compensation', label: 'Hợp đồng & Đãi ngộ' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailTab(tab.id)}
                    className={`px-3 py-2 font-medium text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                      detailTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {detailTab === 'general' && (
                <div className="space-y-4 mb-6 text-sm">
                  <DetailRow label="Mã nhân viên" value={selectedStaff.employee_code} />
                  <DetailRow label="Họ và tên" value={selectedStaff.full_name} bold />
                  <DetailRow label="Ngày sinh" value={formatDate(selectedStaff.birthday)} />
                  <DetailRow
                    label="Giới tính"
                    value={GENDER_LABEL[selectedStaff.gender] || '—'}
                  />
                  <DetailRow
                    label="CCCD/CMND"
                    value={
                      selectedStaff.id_card ? (
                        <span className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-900">{selectedStaff.id_card}</span>
                          {selectedStaff.id_card_verified && (
                            <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-medium border border-green-200">
                              Đã xác thực
                            </span>
                          )}
                        </span>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <DetailRow
                    label="Quốc tịch"
                    value={selectedStaff.nationality || 'Việt Nam'}
                  />
                  <DetailRow label="Email" value={selectedStaff.email || '—'} />
                  <DetailRow label="Số điện thoại" value={selectedStaff.phone || '—'} />
                  <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                    <div className="text-slate-500 mt-2">Ảnh đại diện</div>
                    <div className="flex gap-3 items-center">
                      <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded flex justify-center items-center text-slate-400 text-2xl overflow-hidden">
                        {selectedStaff.avatar ? (
                          <img
                            src={selectedStaff.avatar}
                            alt={selectedStaff.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initialOf(selectedStaff.full_name) || '👤'
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled
                          title="Sắp ra mắt"
                          className="px-3 py-1 border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Camera className="h-3 w-3" /> Thay đổi ảnh
                        </button>
                        <span className="text-[10px] text-slate-400">
                          JPG, PNG. Tối đa 2MB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'qualification' && (
                <div className="space-y-4 mb-6 text-sm">
                  <DetailRow label="Vai trò" value={roleLabel(selectedStaff.role_slug)} />
                  <DetailRow label="Ngày vào làm" value={formatDate(selectedStaff.join_date)} />
                  <DetailRow
                    label="Trạng thái"
                    value={
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${
                          STATUS_BADGE[selectedStaff.status] ||
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {STATUS_LABEL[selectedStaff.status] || selectedStaff.status}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Bằng cấp cao nhất"
                    value={selectedStaff.highest_degree || '—'}
                  />
                  <DetailRow label="Chuyên ngành" value={selectedStaff.major || '—'} />
                  <DetailRow label="Trường đào tạo" value={selectedStaff.school || '—'} />
                  <DetailRow
                    label="Năm tốt nghiệp"
                    value={selectedStaff.graduation_year || '—'}
                  />
                  <DetailRow
                    label="Chứng chỉ hành nghề"
                    value={selectedStaff.practice_certificate || '—'}
                  />
                  <DetailRow
                    label="Chứng chỉ hồ sơ"
                    value={
                      selectedStaff.is_certificate_valid ? (
                        <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-medium border border-green-200">
                          Hợp lệ
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Chưa xác thực</span>
                      )
                    }
                  />
                </div>
              )}

              {detailTab === 'compensation' && (
                <div className="space-y-4 mb-6 text-sm">
                  <DetailRow
                    label="Mức lương cơ bản"
                    value={formatCurrency(selectedStaff.base_salary)}
                    bold
                  />
                  <DetailRow
                    label="Hình thức trả lương"
                    value={
                      selectedStaff.salary_type
                        ? SALARY_TYPE_LABEL[selectedStaff.salary_type] || selectedStaff.salary_type
                        : '—'
                    }
                  />
                  <DetailRow label="Ngân hàng" value={selectedStaff.bank_name || '—'} />
                  <DetailRow
                    label="Số tài khoản"
                    value={selectedStaff.bank_account || '—'}
                  />
                  <DetailRow label="Mã số thuế" value={selectedStaff.tax_code || '—'} />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  type="button"
                  onClick={handleViewProfessionalProfile}
                  className="flex-1 min-w-[140px] py-2 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" /> Hồ sơ chuyên môn
                </button>
                <button
                  type="button"
                  onClick={handleQuickToggleStatus}
                  className="flex-1 min-w-[140px] py-2 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Chuyển trạng thái
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedStaff)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium shadow-sm flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" /> Chỉnh sửa
                </button>
              </div>

              {selectedStaff.user && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-800 mb-3 text-sm">Tài khoản liên kết</h4>
                  <div className="space-y-3 text-sm">
                    <DetailRow
                      label="Tên đăng nhập"
                      value={selectedStaff.user.username || '—'}
                      bold
                    />
                    <DetailRow
                      label="Email đăng nhập"
                      value={selectedStaff.user.email || selectedStaff.email}
                    />
                    <DetailRow
                      label="Vai trò tài khoản"
                      value={roleLabel(selectedStaff.role_slug)}
                    />
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <div className="text-slate-500">Trạng thái</div>
                      <div className="flex justify-between items-center w-full gap-2">
                        {accountBadge && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium border ${accountBadge.className}`}
                          >
                            {accountBadge.label}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleResetPassword(selectedStaff.id)}
                          className="border border-slate-200 px-2 py-1 text-xs rounded hover:bg-slate-50 flex items-center gap-1"
                        >
                          <KeyRound className="h-3 w-3" /> Đặt lại mật khẩu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => staffList[0] && handleSelectStaff(staffList[0])}
            disabled={staffList.length === 0}
            className="hidden xl:flex w-12 h-12 items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Mở khung chi tiết nhân sự"
          >
            <PanelRightOpen className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="border border-slate-200 bg-white rounded-lg p-4 flex flex-wrap gap-4 text-xs text-slate-600 items-start">
        <div className="font-semibold text-slate-800 w-full mb-1">Quy định &amp; lưu ý</div>
        <NoticeItem
          icon={<ShieldCheck className="h-4 w-4 text-slate-400" />}
          text="Không xóa hồ sơ nhân sự, chỉ chuyển trạng thái làm việc."
        />
        <NoticeItem
          icon={<Settings2 className="h-4 w-4 text-slate-400" />}
          text="Khi Tạm nghỉ/Nghỉ việc: hệ thống sẽ khóa tài khoản liên kết tự động."
        />
        <NoticeItem
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          text='Bác sĩ chỉ được "Đang làm việc" khi có hồ sơ chuyên môn/chứng chỉ hợp lệ.'
        />
        <NoticeItem
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          text="Không cho nghỉ việc khi còn lịch khám hoặc dữ liệu nghiệp vụ chưa xử lý."
        />
      </div>

      <StaffFormModal
        open={showModal}
        isEditing={isEditing}
        formData={formData}
        availableRoles={availableRoles}
        onClose={closeFormModal}
        onChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
        onSubmit={handleSubmit}
      />

      <Dialog open={showHistoryModal} onOpenChange={(o) => (o ? openHistoryModal() : closeHistoryModal())}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Lịch sử thay đổi
              {selectedStaff && (
                <span className="text-slate-500 font-normal text-sm ml-2">
                  · {selectedStaff.full_name} ({selectedStaff.employee_code})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            {historyLogs.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                Chưa có lịch sử cho nhân sự này.
              </p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="pb-2 pt-2 font-medium">Thời gian</th>
                    <th className="pb-2 pt-2 font-medium">Người thao tác</th>
                    <th className="pb-2 pt-2 font-medium">Hành động</th>
                    <th className="pb-2 pt-2 font-medium">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLogs.map((log, index) => (
                    <tr key={log.id ?? index} className="border-b border-slate-100">
                      <td className="py-2 text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.created_at || log.timestamp)}
                      </td>
                      <td className="py-2 text-slate-700 whitespace-nowrap">
                        {log.admin_name || '—'}
                      </td>
                      <td className="py-2 text-slate-700">{log.action || '—'}</td>
                      <td className="py-2 text-slate-600">
                        {(() => {
                          if (!log.details) return '—';
                          try {
                            const parsed =
                              typeof log.details === 'string'
                                ? JSON.parse(log.details)
                                : log.details;
                            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
                              return '—';
                            }
                            return (
                              <pre className="text-[11px] whitespace-pre-wrap break-words max-w-[420px]">
                                {JSON.stringify(parsed, null, 2)}
                              </pre>
                            );
                          } catch {
                            return String(log.details);
                          }
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DetailRow = ({ label, value, bold = false }) => (
  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
    <div className="text-slate-500">{label}</div>
    <div className={bold ? 'text-slate-900 font-medium' : 'text-slate-900'}>
      {value === undefined || value === null || value === '' ? '—' : value}
    </div>
  </div>
);

const NoticeItem = ({ icon, text }) => (
  <div className="flex items-start gap-2 flex-1 min-w-[220px]">
    <span className="mt-0.5">{icon}</span>
    <span>{text}</span>
  </div>
);
