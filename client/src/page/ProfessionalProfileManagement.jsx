import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Plus, FileWarning, AlarmClock, ClipboardList } from 'lucide-react';
import ProfessionalProfileTable from '@/features/professional-profiles/components/ProfessionalProfileTable';
import ProfessionalProfileForm from '@/features/professional-profiles/components/ProfessionalProfileForm';
import ProfessionalProfileWizardModal from '@/features/professional-profiles/components/ProfessionalProfileWizardModal';
import ProfessionalProfileDetailPanel from '@/features/professional-profiles/components/ProfessionalProfileDetailPanel';
import professionalProfileApi from '@/api/professionalProfileApi';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  buildProfileFormData,
  createEmptyCertificate,
  createEmptyProfileForm,
  createEmptySpecialty,
  mapProfileToForm,
  PROFILE_STATUS_META,
} from '@/features/professional-profiles/utils';

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export default function ProfessionalProfileManagement() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStaffId, setFilterStaffId] = useState('all');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [openWizard, setOpenWizard] = useState(false);
  const [submittingWizard, setSubmittingWizard] = useState(false);
  const [form, setForm] = useState(createEmptyProfileForm());
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyDialog, setHistoryDialog] = useState({ open: false, profile: null, items: [] });

  const loadOptions = async () => {
    const response = await professionalProfileApi.getOptions();
    setStaffOptions(response.data.staff || []);
    setServices(response.data.services || []);
    setBranches(response.data.branches || []);
    setDegrees(response.data.degrees || []);
  };

  const loadProfiles = async (page = 1, overrides = {}) => {
    setLoading(true);
    try {
      const response = await professionalProfileApi.getAll({
        page,
        per_page: overrides.perPage ?? perPage,
        search: searchTerm,
        profile_role: filterRole,
        status: filterStatus,
      });
      setProfiles(response.data.data || []);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || (response.data.data || []).length);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách hồ sơ chuyên môn.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOptions().catch(() => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh mục hồ sơ chuyên môn.',
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // BUG-7 FIX: Đọc query param ?staff=ID để tự động tìm kiếm khi điều hướng từ module Nhân sự
  useEffect(() => {
    const staffParam = searchParams.get('staff');
    if (staffParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilterStaffId(staffParam);
      // Tìm nhân sự theo ID để lấy tên hiển thị trong ô search
      const matchedStaff = staffOptions.find((s) => String(s.id) === staffParam);
      if (matchedStaff) {
        setSearchTerm(matchedStaff.full_name);
      }
      // Xóa param khỏi URL để tránh re-apply khi filter thay đổi
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, staffOptions]);

  // Làm mới danh sách nhân sự mỗi khi wizard tạo hồ sơ được mở
  useEffect(() => {
    if (!openWizard) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOptions().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openWizard]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfiles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterRole, filterStatus, perPage]);

  const filteredStaffOptions = useMemo(() => {
    if (!form.profile_role) return staffOptions;
    return staffOptions.filter((staff) => staff.role_slug === form.profile_role);
  }, [staffOptions, form.profile_role]);

  const stats = useMemo(() => {
    const expiringSoon = profiles.filter((p) => p.expiring_soon && !p.has_expired_certificate).length;
    const expired = profiles.filter((p) => p.has_expired_certificate || p.status === 'expired').length;
    const pending = profiles.filter((p) => p.status === 'pending').length;
    return { expiringSoon, expired, pending };
  }, [profiles]);

  const openCreateForm = () => {
    setOpenWizard(true);
  };

  const openEditForm = async (profile) => {
    try {
      const response = await professionalProfileApi.getById(profile.id);
      setForm(mapProfileToForm(response.data));
      setOpenForm(true);
    } catch {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải chi tiết hồ sơ.' });
    }
  };

  const loadProfileDetail = async (profileId) => {
    setLoadingHistory(true);
    try {
      const [detailRes, historyRes] = await Promise.all([
        professionalProfileApi.getById(profileId),
        professionalProfileApi.getHistory(profileId).catch(() => ({ data: [] })),
      ]);
      setSelectedProfile(detailRes.data);
      setSelectedHistory(historyRes.data || []);
    } catch {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải chi tiết hồ sơ.' });
      setSelectedProfile(null);
      setSelectedHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewProfile = (profile) => {
    if (selectedProfile?.id === profile.id) return;
    loadProfileDetail(profile.id);
  };

  const handleClosePanel = () => {
    setSelectedProfile(null);
    setSelectedHistory([]);
  };

  const handleSubmit = async () => {
    try {
      const payload = buildProfileFormData(form);
      if (form.id) {
        await professionalProfileApi.update(form.id, payload);
        toast({ title: 'Thành công', description: 'Đã cập nhật hồ sơ chuyên môn.' });
      } else {
        await professionalProfileApi.create(payload);
        toast({ title: 'Thành công', description: 'Đã tạo hồ sơ chuyên môn mới.' });
      }
      setOpenForm(false);
      loadProfiles(currentPage);
      if (selectedProfile?.id && form.id === selectedProfile.id) {
        loadProfileDetail(selectedProfile.id);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Lưu hồ sơ thất bại.',
      });
    }
  };

  const handleWizardSubmit = async (wizardForm) => {
    setSubmittingWizard(true);
    try {
      const formData = buildProfileFormData(wizardForm);
      await professionalProfileApi.create(formData);
      toast({ title: 'Thành công', description: 'Đã tạo hồ sơ chuyên môn mới.' });
      setOpenWizard(false);
      // Tải lại cả danh sách hồ sơ lẫn danh sách nhân sự chưa có hồ sơ
      loadProfiles(1);
      loadOptions().catch(() => {});
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Tạo hồ sơ thất bại.',
      });
    } finally {
      setSubmittingWizard(false);
    }
  };

  const handleAction = async (runner, successMessage, profileId) => {
    try {
      await runner();
      toast({ title: 'Thành công', description: successMessage });
      loadProfiles(currentPage);
      if (profileId && selectedProfile?.id === profileId) {
        loadProfileDetail(profileId);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Thao tác thất bại.',
      });
    }
  };

  const handleReject = async (profile) => {
    const reason = window.prompt('Nhập lý do từ chối hồ sơ:');
    if (reason === null) return;
    await handleAction(
      () => professionalProfileApi.reject(profile.id, reason),
      'Đã từ chối hồ sơ.',
      profile.id
    );
  };

  const handleOpenHistoryDialog = async (profile) => {
    try {
      const response = await professionalProfileApi.getHistory(profile.id);
      setHistoryDialog({ open: true, profile, items: response.data || [] });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải lịch sử thay đổi.',
      });
    }
  };

  const handleExportExcel = () => {
    toast({
      title: 'Sắp ra mắt',
      description: 'Tính năng xuất Excel hồ sơ chuyên môn đang được phát triển.',
    });
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800">Quản lý hồ sơ chuyên môn</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Thêm hồ sơ
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <div className="flex-1 min-w-0 w-full">
          <ProfessionalProfileTable
            profiles={profiles}
            loading={loading}
            searchTerm={searchTerm}
            filterRole={filterRole}
            filterStatus={filterStatus}
            filterStaffId={filterStaffId}
            staffOptions={staffOptions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            selectedId={selectedProfile?.id}
            onSearchChange={setSearchTerm}
            onRoleChange={(value) => {
              setFilterRole(value);
              setFilterStaffId('all');
            }}
            onStatusChange={setFilterStatus}
            onStaffChange={setFilterStaffId}
            onRefresh={() => loadProfiles(currentPage)}
            onView={handleViewProfile}
            onEdit={openEditForm}
            onOpenMenu={(profile) => handleOpenHistoryDialog(profile)}
            onPageChange={(page) => {
              if (page < 1 || page > totalPages) return;
              loadProfiles(page);
            }}
            onPerPageChange={(value) => {
              setPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>

        <ProfessionalProfileDetailPanel
          profile={selectedProfile}
          history={selectedHistory}
          loadingHistory={loadingHistory}
          onClose={handleClosePanel}
          onEdit={openEditForm}
          onApprove={(profile) =>
            handleAction(
              () => professionalProfileApi.approve(profile.id),
              'Đã duyệt hồ sơ.',
              profile.id
            )
          }
          onReject={handleReject}
          onSubmit={(profile) =>
            handleAction(
              () => professionalProfileApi.submit(profile.id),
              'Đã chuyển hồ sơ sang chờ duyệt.',
              profile.id
            )
          }
          onInvalidate={(profile) =>
            handleAction(
              () => professionalProfileApi.invalidate(profile.id),
              'Đã vô hiệu hoá hồ sơ.',
              profile.id
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.5fr_1.5fr_1fr] gap-5">
        <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Lịch sử thay đổi (Audit Log)</h3>
            {selectedProfile && (
              <button
                type="button"
                onClick={() => handleOpenHistoryDialog(selectedProfile)}
                className="text-blue-600 text-xs font-medium hover:underline"
              >
                Xem tất cả
              </button>
            )}
          </div>
          {!selectedProfile ? (
            <p className="text-xs text-slate-400">Chọn một hồ sơ để xem lịch sử thay đổi.</p>
          ) : selectedHistory.length === 0 ? (
            <p className="text-xs text-slate-400">Chưa có thay đổi nào được ghi nhận.</p>
          ) : (
            <table className="w-full text-[12px] text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="pb-2 font-medium">Thời gian</th>
                  <th className="pb-2 font-medium">Người thực hiện</th>
                  <th className="pb-2 font-medium">Hành động</th>
                  <th className="pb-2 font-medium">Nội dung</th>
                </tr>
              </thead>
              <tbody>
                {selectedHistory.slice(0, 5).map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-2">{log.user?.name || 'Hệ thống'}</td>
                    <td className="py-2">{log.action}</td>
                    <td className="py-2 text-slate-600 truncate max-w-[200px]">
                      {log.summary || (log.changes ? 'Có thay đổi' : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">Cảnh báo tự động</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 sm:border-r sm:pr-2 last:border-0">
              <AlarmClock className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">
                  {String(stats.expiringSoon).padStart(2, '0')}{' '}
                  <span className="font-normal text-xs">chứng chỉ</span>
                </span>
                <span className="text-[10px] text-slate-500">sắp hết hạn (≤ 30 ngày)</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:border-r sm:pr-2">
              <FileWarning className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">
                  {String(stats.expired).padStart(2, '0')}{' '}
                  <span className="font-normal text-xs">hồ sơ đã hết hạn</span>
                </span>
                <span className="text-[10px] text-red-600">Không thể nhận công việc mới</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">
                  {String(stats.pending).padStart(2, '0')}{' '}
                  <span className="font-normal text-xs">hồ sơ chờ duyệt</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFilterStatus('pending')}
                  className="text-[10px] text-blue-600 hover:underline text-left"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">
            Thống kê dựa trên trang hiện tại — tổng cộng {totalItems} hồ sơ.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-2 text-sm">Ghi chú</h3>
          <ul className="list-disc pl-4 text-[12px] text-slate-600 space-y-1.5">
            <li>
              Chỉ hồ sơ ở trạng thái{' '}
              <span className={`px-1 rounded text-[10px] ${PROFILE_STATUS_META.approved.className}`}>
                Đã duyệt
              </span>{' '}
              mới được dùng để phân công công việc. Hồ sơ hết hạn sẽ tự động chuyển sang trạng thái Hết hạn.
            </li>
            <li>Không xoá hồ sơ chuyên môn, chỉ vô hiệu hoá.</li>
            <li>Mọi thay đổi đều được ghi nhận trong Audit Log.</li>
          </ul>
        </section>
      </div>

      <ProfessionalProfileWizardModal
        open={openWizard}
        staffOptions={staffOptions}
        branches={branches}
        services={services}
        degrees={degrees}
        submitting={submittingWizard}
        onClose={() => setOpenWizard(false)}
        onSubmit={handleWizardSubmit}
      />

      <ProfessionalProfileForm
        open={openForm}
        mode="admin"
        form={form}
        staffOptions={filteredStaffOptions}
        services={services}
        onClose={() => setOpenForm(false)}
        onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
        onAddSpecialty={() =>
          setForm((prev) => ({ ...prev, specialties: [...prev.specialties, createEmptySpecialty()] }))
        }
        onRemoveSpecialty={(index) =>
          setForm((prev) => ({
            ...prev,
            specialties: prev.specialties.filter((_, itemIndex) => itemIndex !== index),
          }))
        }
        onUpdateSpecialty={(index, field, value) =>
          setForm((prev) => ({
            ...prev,
            specialties: prev.specialties.map((specialty, itemIndex) =>
              itemIndex === index
                ? { ...specialty, [field]: field === 'years_experience' ? Number(value) : value }
                : specialty
            ),
          }))
        }
        onAddCertificate={() =>
          setForm((prev) => ({
            ...prev,
            certificates: [...prev.certificates, createEmptyCertificate()],
          }))
        }
        onRemoveCertificate={(index) =>
          setForm((prev) => ({
            ...prev,
            certificates: prev.certificates.filter((_, itemIndex) => itemIndex !== index),
          }))
        }
        onUpdateCertificate={(index, field, value) =>
          setForm((prev) => ({
            ...prev,
            certificates: prev.certificates.map((certificate, itemIndex) =>
              itemIndex === index
                ? {
                    ...certificate,
                    [field]: value === 'general' ? '' : value,
                    professional_profile_specialty_id:
                      field === 'specialty_client_key'
                        ? null
                        : certificate.professional_profile_specialty_id,
                  }
                : certificate
            ),
          }))
        }
        onSubmit={handleSubmit}
      />

      <Dialog
        open={historyDialog.open}
        onOpenChange={(open) =>
          !open && setHistoryDialog({ open: false, profile: null, items: [] })
        }
      >
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>
              Lịch sử thay đổi · {historyDialog.profile?.staff?.full_name || ''}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {historyDialog.items.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">Chưa có lịch sử thay đổi.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="pb-2 font-medium">Thời gian</th>
                    <th className="pb-2 font-medium">Người thực hiện</th>
                    <th className="pb-2 font-medium">Hành động</th>
                    <th className="pb-2 font-medium">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {historyDialog.items.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 last:border-0 align-top">
                      <td className="py-2 text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="py-2">{log.user?.name || 'Hệ thống'}</td>
                      <td className="py-2">{log.action}</td>
                      <td className="py-2 text-slate-600">
                        <pre className="text-[11px] whitespace-pre-wrap break-words text-slate-600">
                          {JSON.stringify(log.changes || log.summary || {}, null, 2)}
                        </pre>
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
