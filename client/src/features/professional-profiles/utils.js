export const PROFILE_ROLE_OPTIONS = [
  { value: 'bac_si', label: 'Bác sĩ' },
  { value: 'ke_toan', label: 'Kế toán' },
];

export const PROFILE_STATUS_META = {
  draft: { label: 'Chưa hoàn thiện', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Đã duyệt', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  expired: { label: 'Hết hạn', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  rejected: { label: 'Từ chối', className: 'bg-red-50 text-red-700 border-red-200' },
  inactive: { label: 'Vô hiệu hóa', className: 'bg-slate-200 text-slate-700 border-slate-300' },
};

export const CERTIFICATE_TYPE_OPTIONS = {
  bac_si: ['Chứng chỉ hành nghề', 'Chứng chỉ chuyên khoa', 'Bằng cấp', 'Tài liệu khác'],
  ke_toan: ['Chứng chỉ kế toán', 'Bằng cấp', 'Tài liệu khác'],
};

export const createEmptySpecialty = () => ({
  id: undefined,
  client_key: `sp_${Date.now()}_${Math.random().toString(16).slice(2)}`,
  specialty_name: '',
  degree: '',
  years_experience: 0,
  service_scope: [],
  branch_or_room: '',
  notes: '',
});

export const createEmptyCertificate = () => ({
  id: undefined,
  certificate_type: '',
  certificate_name: '',
  certificate_number: '',
  issued_date: '',
  expiry_date: '',
  issuer: '',
  scope_label: '',
  notes: '',
  is_primary: false,
  professional_profile_specialty_id: null,
  specialty_client_key: '',
  file: null,
  existing_file_name: '',
});

export const createEmptyProfileForm = () => ({
  id: undefined,
  staff_id: '',
  profile_role: '',
  status: 'draft',
  notes: '',
  degree: '',
  years_experience: '',
  branch_id: '',
  service_scope: [],
  specialties: [],
  certificates: [],
});

export const mapProfileToForm = (profile) => {
  if (!profile) {
    return createEmptyProfileForm();
  }

  const specialties = (profile.specialties || []).map((specialty) => ({
    id: specialty.id,
    client_key: `sp_${specialty.id}`,
    specialty_name: specialty.specialty_name || '',
    degree: specialty.degree || '',
    years_experience: specialty.years_experience || 0,
    service_scope: specialty.service_scope || [],
    branch_or_room: specialty.branch_or_room || '',
    notes: specialty.notes || '',
  }));

  return {
    id: profile.id,
    staff_id: String(profile.staff_id || profile.staff?.id || ''),
    profile_role: profile.profile_role || '',
    status: profile.status || 'draft',
    notes: profile.notes || '',
    degree: profile.degree || '',
    years_experience:
      profile.years_experience !== null && profile.years_experience !== undefined
        ? String(profile.years_experience)
        : '',
    branch_id: profile.branch_id ? String(profile.branch_id) : '',
    service_scope: Array.isArray(profile.service_scope) ? profile.service_scope : [],
    specialties,
    certificates: (profile.certificates || []).map((certificate) => ({
      id: certificate.id,
      certificate_type: certificate.certificate_type || '',
      certificate_name: certificate.certificate_name || '',
      certificate_number: certificate.certificate_number || '',
      issued_date: certificate.issued_date ? String(certificate.issued_date).slice(0, 10) : '',
      expiry_date: certificate.expiry_date ? String(certificate.expiry_date).slice(0, 10) : '',
      issuer: certificate.issuer || '',
      scope_label: certificate.scope_label || '',
      notes: certificate.notes || '',
      is_primary: Boolean(certificate.is_primary),
      professional_profile_specialty_id: certificate.professional_profile_specialty_id || certificate.specialty?.id || null,
      specialty_client_key: certificate.specialty ? `sp_${certificate.specialty.id}` : '',
      file: null,
      existing_file_name: certificate.file_name || '',
    })),
  };
};

export const buildProfileFormData = (form, { selfService = false } = {}) => {
  const data = new FormData();

  if (!selfService) {
    data.append('staff_id', form.staff_id);
    data.append('profile_role', form.profile_role);
    data.append('status', form.status || 'draft');
  }

  data.append('notes', form.notes || '');
  if (form.degree !== undefined && form.degree !== null && form.degree !== '') {
    data.append('degree', form.degree);
  }
  if (form.years_experience !== undefined && form.years_experience !== null && form.years_experience !== '') {
    data.append('years_experience', String(form.years_experience));
  }
  if (form.branch_id) {
    data.append('branch_id', String(form.branch_id));
  }
  data.append('service_scope_payload', JSON.stringify(form.service_scope || []));
  data.append('specialties_payload', JSON.stringify(form.specialties || []));
  data.append(
    'certificates_payload',
    JSON.stringify(
      (form.certificates || []).map((certificate) => ({
        id: certificate.id,
        certificate_type: certificate.certificate_type,
        certificate_name: certificate.certificate_name,
        certificate_number: certificate.certificate_number,
        issued_date: certificate.issued_date || null,
        expiry_date: certificate.expiry_date || null,
        issuer: certificate.issuer || null,
        scope_label: certificate.scope_label || null,
        notes: certificate.notes || null,
        is_primary: Boolean(certificate.is_primary),
        professional_profile_specialty_id: certificate.professional_profile_specialty_id || null,
        specialty_client_key: certificate.specialty_client_key || null,
      }))
    )
  );

  (form.certificates || []).forEach((certificate, index) => {
    if (certificate.file instanceof File) {
      data.append(`certificate_files[${index}]`, certificate.file);
    }
  });

  return data;
};
