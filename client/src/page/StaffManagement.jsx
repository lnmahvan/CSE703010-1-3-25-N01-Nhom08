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
} from 'lucide-react';
import { useStaffManagement } from '@/features/staff-management/hooks/useStaffManagement';
import StaffTable from '@/features/staff-management/components/StaffTable';
import StaffFormModal from '@/features/staff-management/components/StaffFormModal';

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
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
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
    searchTerm,
    filterRoleId,
    filterStatus,
    showModal,
    isEditing,
    formData,
    historyLogs,
    setSearchTerm,
    setFilterRoleId,
    setFilterStatus,
    setFormData,
    openCreateModal,
    openEditModal,
    closeFormModal,
    loadHistory,
    loadStaff,
    handleToggleStatus,
    handleSubmit,
  } = useStaffManagement();

  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [detailTab, setDetailTab] = useState('general');

  // Resolve panel target: explicit selection → fall back to first row
  const selectedStaff = useMemo(() => {
    const found = staffList.find((s) => s.id === selectedStaffId);
    return found || staffList[0] || null;
  }, [selectedStaffId, staffList]);

  const lockedCount = useMemo(
    () => staffList.filter((s) => s.status !== 'working').length,
    [staffList]
  );

  const handleSelectStaff = (staff) => {
    setSelectedStaffId(staff.id);
    if (staff.id) {
      loadHistory(staff.id);
    }
  };

  const handleQuickToggleStatus = () => {
    if (!selectedStaff) return;
    handleToggleStatus(selectedStaff.id, selectedStaff.status);
  };

  const handleViewProfessionalProfile = () => {
    if (!selectedStaff) return;
    navigate(`/professional-profiles?staff=${selectedStaff.id}`);
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
            searchTerm={searchTerm}
            filterRoleId={filterRoleId}
            filterStatus={filterStatus}
            selectedStaffId={selectedStaffId}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setFilterRoleId}
            onStatusFilterChange={setFilterStatus}
            onSelectStaff={handleSelectStaff}
            onOpenHistory={loadHistory}
            onEdit={openEditModal}
            onToggleStatus={handleToggleStatus}
            onPageChange={loadStaff}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Lịch sử thay đổi (Audit Log)</h3>
                {selectedStaff && (
                  <button
                    type="button"
                    onClick={() => loadHistory(selectedStaff.id)}
                    className="text-blue-600 text-xs font-medium hover:underline"
                  >
                    Làm mới
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
                            {log.actor_name || log.user?.name || log.actor || '—'}
                          </td>
                          <td className="py-2 text-slate-700 whitespace-nowrap">
                            {log.action || '—'}
                          </td>
                          <td className="py-2 text-slate-600">
                            {log.description || log.content || log.note || '—'}
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

        <aside className="w-full xl:w-[400px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-shrink-0">
          <div className="px-5 py-4 flex justify-between items-center border-b border-slate-200">
            <h2 className="font-semibold text-slate-800 text-lg">Chi tiết nhân sự</h2>
            {selectedStaff && (
              <span className="text-xs text-slate-400">
                {staffList.length} kết quả đang xem
              </span>
            )}
          </div>

          {!selectedStaff ? (
            <div className="p-6 text-sm text-slate-500 text-center">
              Chọn một dòng trong bảng để xem chi tiết.
            </div>
          ) : (
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
                    {selectedStaff.updated_at && (
                      <p>Cập nhật lần cuối: {formatDateTime(selectedStaff.updated_at)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
                {[
                  { id: 'general', label: 'Thông tin chung' },
                  { id: 'contact', label: 'Liên hệ' },
                  { id: 'work', label: 'Công việc' },
                  { id: 'system', label: 'Hệ thống' },
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
                </div>
              )}

              {detailTab === 'contact' && (
                <div className="space-y-4 mb-6 text-sm">
                  <DetailRow label="Email" value={selectedStaff.email || '—'} />
                  <DetailRow label="Số điện thoại" value={selectedStaff.phone || '—'} />
                </div>
              )}

              {detailTab === 'work' && (
                <div className="space-y-4 mb-6 text-sm">
                  <DetailRow label="Vai trò" value={roleLabel(selectedStaff.role_slug)} />
                  <DetailRow label="Ngày vào làm" value={formatDate(selectedStaff.join_date)} />
                  <DetailRow
                    label="Chứng chỉ"
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

              {detailTab === 'system' && (
                <div className="space-y-3 mb-6 text-sm">
                  <DetailRow label="Tạo lúc" value={formatDateTime(selectedStaff.created_at)} />
                  <DetailRow label="Cập nhật" value={formatDateTime(selectedStaff.updated_at)} />
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
                      label="Trạng thái"
                      value={
                        accountBadge && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium border ${accountBadge.className}`}
                          >
                            {accountBadge.label}
                          </span>
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
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
    </div>
  );
}

const DetailRow = ({ label, value, bold = false }) => (
  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
    <div className="text-slate-500">{label}</div>
    <div className={bold ? 'text-slate-900 font-medium' : 'text-slate-900'}>{value || '—'}</div>
  </div>
);

const NoticeItem = ({ icon, text }) => (
  <div className="flex items-start gap-2 flex-1 min-w-[220px]">
    <span className="mt-0.5">{icon}</span>
    <span>{text}</span>
  </div>
);
