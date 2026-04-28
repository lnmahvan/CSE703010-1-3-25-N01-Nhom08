import React, { useCallback, useEffect, useState } from 'react';
import { BriefcaseMedical, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfessionalProfileForm from '@/features/professional-profiles/components/ProfessionalProfileForm';
import professionalProfileApi from '@/api/professionalProfileApi';
import { useToast } from '@/hooks/use-toast';
import {
  buildProfileFormData,
  createEmptyCertificate,
  createEmptySpecialty,
  mapProfileToForm,
} from '@/features/professional-profiles/utils';

export default function MyProfessionalProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [services, setServices] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const loadMyProfile = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const response = await professionalProfileApi.getMine();
      setProfile(response.data.profile || null);
      setForm(mapProfileToForm(response.data.profile || null));
      setServices(response.data.options?.services || []);
    } catch {
      toast({ variant: 'destructive', title: 'Loi', description: 'Khong the tai ho so chuyen mon cua ban.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadMyProfile();
    });
  }, [loadMyProfile]);

  const handleSave = async () => {
    if (!form?.id) {
      toast({ variant: 'destructive', title: 'Thieu ho so', description: 'Admin can tao ho so chuyen mon ban dau cho ban.' });
      return;
    }

    try {
      const payload = buildProfileFormData(form, { selfService: true });
      await professionalProfileApi.updateMine(form.id, payload);
      toast({ title: 'Thanh cong', description: 'Da cap nhat ho so va chuyen sang cho duyet.' });
      setOpenForm(false);
      loadMyProfile();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Loi', description: error.response?.data?.message || 'Khong the cap nhat ho so.' });
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;
    try {
      await professionalProfileApi.submitMine(profile.id);
      toast({ title: 'Thanh cong', description: 'Da gui ho so cho admin duyet.' });
      loadMyProfile();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Loi', description: error.response?.data?.message || 'Khong the gui duyet ho so.' });
    }
  };

  if (loading) {
    return <div className="bg-white rounded-[2rem] border border-slate-100 p-8">Dang tai ho so chuyen mon...</div>;
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Ho so chuyen mon cua toi</h3>
        <p className="text-slate-500">Chua co ho so chuyen mon duoc tao. Admin can khoi tao ho so ban dau truoc khi ban cap nhat.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <BriefcaseMedical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Ho so chuyen mon cua toi</h3>
            <p className="text-sm text-slate-500">Ban chi duoc sua cac truong chuyen mon duoc phan quyen. Sau khi luu, ho so chuyen sang cho duyet.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setOpenForm(true)} className="rounded-xl border-slate-200">Cap nhat ho so</Button>
          <Button onClick={handleSubmit} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
            <Send className="w-4 h-4 mr-2" /> Gui duyet
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <MetricCard label="Vai tro" value={profile.profile_role === 'bac_si' ? 'Bac si' : 'Ke toan'} />
          <MetricCard label="Trang thai" value={profile.status} />
          <MetricCard label="Chung chi" value={String(profile.certificates?.length || 0)} />
          <MetricCard label="Canh bao" value={profile.has_expired_certificate ? 'Het han' : profile.expiring_soon ? 'Sap het han' : 'On dinh'} />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <h4 className="font-semibold text-slate-800 mb-3">Thong tin hien tai</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div>Nhan su: <span className="font-medium text-slate-800">{profile.staff?.full_name}</span></div>
            <div>Ghi chu: <span className="text-slate-800">{profile.notes || 'Chua co ghi chu'}</span></div>
            {profile.rejection_reason && <div>Ly do tu choi gan nhat: <span className="text-red-700">{profile.rejection_reason}</span></div>}
          </div>
        </div>
      </div>

      <ProfessionalProfileForm
        open={openForm}
        mode="self"
        form={form}
        staffOptions={profile?.staff ? [profile.staff] : []}
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
        onSubmit={handleSave}
      />
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-800">{value}</div>
    </div>
  );
}
