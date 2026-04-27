import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseMedical } from 'lucide-react';
import ProfessionalProfileTable from '@/features/professional-profiles/components/ProfessionalProfileTable';
import ProfessionalProfileForm from '@/features/professional-profiles/components/ProfessionalProfileForm';
import ProfessionalProfileDetailModal from '@/features/professional-profiles/components/ProfessionalProfileDetailModal';
import professionalProfileApi from '@/api/professionalProfileApi';
import { useToast } from '@/hooks/use-toast';
import {
  buildProfileFormData,
  createEmptyCertificate,
  createEmptyProfileForm,
  createEmptySpecialty,
  mapProfileToForm,
} from '@/features/professional-profiles/utils';

export default function ProfessionalProfileManagement() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(createEmptyProfileForm());
  const [openDetail, setOpenDetail] = useState(false);
  const [detailProfile, setDetailProfile] = useState(null);

  const loadOptions = async () => {
    const response = await professionalProfileApi.getOptions();
    setStaffOptions(response.data.staff || []);
    setServices(response.data.services || []);
  };

  const loadProfiles = async (page = 1) => {
    setLoading(true);
    try {
      const response = await professionalProfileApi.getAll({
        page,
        per_page: 10,
        search: searchTerm,
        profile_role: filterRole,
        status: filterStatus,
      });
      setProfiles(response.data.data || []);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
    } catch {
      toast({ variant: 'destructive', title: 'Loi', description: 'Khong the tai danh sach ho so chuyen mon.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().catch(() => {
      toast({ variant: 'destructive', title: 'Loi', description: 'Khong the tai danh muc ho so chuyen mon.' });
    });
  }, []);

  useEffect(() => {
    loadProfiles(1);
  }, [searchTerm, filterRole, filterStatus]);

  const filteredStaffOptions = useMemo(() => {
    if (!form.profile_role) return staffOptions;
    return staffOptions.filter((staff) => staff.role_slug === form.profile_role);
  }, [staffOptions, form.profile_role]);

  const openCreateForm = () => {
    setForm(createEmptyProfileForm());
    setOpenForm(true);
  };

  const openEditForm = async (profile) => {
    try {
      const response = await professionalProfileApi.getById(profile.id);
      setForm(mapProfileToForm(response.data));
      setOpenForm(true);
    } catch {
      toast({ variant: 'destructive', title: 'Loi', description: 'Khong the tai chi tiet ho so.' });
    }
  };

  const openDetailModal = async (profile) => {
    try {
      const response = await professionalProfileApi.getById(profile.id);
      setDetailProfile(response.data);
      setOpenDetail(true);
    } catch {
      toast({ variant: 'destructive', title: 'Loi', description: 'Khong the tai chi tiet ho so.' });
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = buildProfileFormData(form);
      if (form.id) {
        await professionalProfileApi.update(form.id, payload);
        toast({ title: 'Thanh cong', description: 'Da cap nhat ho so chuyen mon.' });
      } else {
        await professionalProfileApi.create(payload);
        toast({ title: 'Thanh cong', description: 'Da tao ho so chuyen mon moi.' });
      }
      setOpenForm(false);
      loadProfiles(currentPage);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Loi', description: error.response?.data?.message || 'Luu ho so that bai.' });
    }
  };

  const handleAction = async (runner, successMessage) => {
    try {
      await runner();
      toast({ title: 'Thanh cong', description: successMessage });
      loadProfiles(currentPage);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Loi', description: error.response?.data?.message || 'Thao tac that bai.' });
    }
  };

  const handleReject = async (profile) => {
    const reason = window.prompt('Nhap ly do tu choi ho so:');
    if (reason === null) return;
    await handleAction(() => professionalProfileApi.reject(profile.id, reason), 'Da tu choi ho so.');
  };

  const handleOpenHistory = async (profile) => {
    try {
      const response = await professionalProfileApi.getHistory(profile.id);
      const content = (response.data || [])
        .map((log) => `${new Date(log.created_at).toLocaleString('vi-VN')} - ${log.action}`)
        .join('\n');
      window.alert(content || 'Chua co lich su thay doi.');
    } catch {
      toast({ variant: 'destructive', title: 'Loi', description: 'Khong the tai lich su thay doi.' });
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <BriefcaseMedical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Quan ly ho so chuyen mon</h3>
            <p className="text-sm text-slate-500">Quan ly chung chi, chuyen mon, luong duyet va canh bao het han.</p>
          </div>
        </div>
      </div>

      <ProfessionalProfileTable
        profiles={profiles}
        loading={loading}
        searchTerm={searchTerm}
        filterRole={filterRole}
        filterStatus={filterStatus}
        currentPage={currentPage}
        totalPages={totalPages}
        onSearchChange={setSearchTerm}
        onRoleChange={setFilterRole}
        onStatusChange={setFilterStatus}
        onRefresh={() => loadProfiles(1)}
        onCreate={openCreateForm}
        onView={openDetailModal}
        onEdit={openEditForm}
        onSubmit={(profile) => handleAction(() => professionalProfileApi.submit(profile.id), 'Da chuyen ho so sang cho duyet.')}
        onApprove={(profile) => handleAction(() => professionalProfileApi.approve(profile.id), 'Da duyet ho so.')}
        onReject={handleReject}
        onInvalidate={(profile) => handleAction(() => professionalProfileApi.invalidate(profile.id), 'Da vo hieu hoa ho so.')}
        onOpenHistory={handleOpenHistory}
        onPageChange={loadProfiles}
      />

      <ProfessionalProfileForm
        open={openForm}
        mode="admin"
        form={form}
        staffOptions={filteredStaffOptions}
        services={services}
        onClose={() => setOpenForm(false)}
        onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
        onAddSpecialty={() => setForm((prev) => ({ ...prev, specialties: [...prev.specialties, createEmptySpecialty()] }))}
        onRemoveSpecialty={(index) => setForm((prev) => ({ ...prev, specialties: prev.specialties.filter((_, itemIndex) => itemIndex !== index) }))}
        onUpdateSpecialty={(index, field, value) => setForm((prev) => ({
          ...prev,
          specialties: prev.specialties.map((specialty, itemIndex) => itemIndex === index ? { ...specialty, [field]: field === 'years_experience' ? Number(value) : value } : specialty),
        }))}
        onAddCertificate={() => setForm((prev) => ({ ...prev, certificates: [...prev.certificates, createEmptyCertificate()] }))}
        onRemoveCertificate={(index) => setForm((prev) => ({ ...prev, certificates: prev.certificates.filter((_, itemIndex) => itemIndex !== index) }))}
        onUpdateCertificate={(index, field, value) => setForm((prev) => ({
          ...prev,
          certificates: prev.certificates.map((certificate, itemIndex) => itemIndex === index
            ? {
                ...certificate,
                [field]: value === 'general' ? '' : value,
                professional_profile_specialty_id: field === 'specialty_client_key' ? null : certificate.professional_profile_specialty_id,
              }
            : certificate),
        }))}
        onSubmit={handleSubmit}
      />

      <ProfessionalProfileDetailModal
        open={openDetail}
        profile={detailProfile}
        onClose={() => {
          setOpenDetail(false);
          setDetailProfile(null);
        }}
      />
    </div>
  );
}
