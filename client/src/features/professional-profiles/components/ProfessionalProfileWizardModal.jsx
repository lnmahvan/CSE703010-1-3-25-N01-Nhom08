import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Search,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Trash2,
  AlertCircle,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Chọn nhân sự' },
  { id: 2, label: 'Thông tin chuyên môn' },
  { id: 3, label: 'Tài liệu đính kèm' },
  { id: 4, label: 'Xác nhận' },
];

const initialOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_BYTES = 10 * 1024 * 1024;

function StaffOption({ staff, checked, onChange }) {
  const branchLabel = staff.branch?.name || staff.branch?.city || 'Chưa gán chi nhánh';
  const roleLabel = staff.role_slug === 'bac_si' ? 'Bác sĩ' : 'Kế toán';
  return (
    <label
      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
        checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <input
        type="radio"
        name="wizard-staff"
        className="accent-blue-600"
        checked={checked}
        onChange={() => onChange(staff)}
      />
      <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-medium text-slate-600 flex-shrink-0 overflow-hidden">
        {staff.avatar ? (
          <img src={staff.avatar} alt={staff.full_name} className="w-full h-full object-cover" />
        ) : (
          initialOf(staff.full_name)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 truncate">{staff.full_name}</div>
        <div className="text-xs text-slate-500 truncate">
          {roleLabel} · {branchLabel} · {staff.employee_code}
        </div>
      </div>
    </label>
  );
}

function TagInput({ value = [], onChange, placeholder = 'Nhập rồi Enter để thêm', suggestions = [] }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = String(raw || '').trim();
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div
        className="flex flex-wrap gap-1.5 p-2 border border-slate-300 rounded-md min-h-[42px] bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(idx);
              }}
              className="hover:text-blue-900"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) {
              removeTag(value.length - 1);
            }
          }}
          placeholder={value.length ? '' : placeholder}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {suggestions
            .filter((s) => !value.includes(s))
            .slice(0, 8)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default function ProfessionalProfileWizardModal({
  open,
  staffOptions = [],
  branches = [],
  services = [],
  degrees = [],
  isEdit = false,
  initialForm = null,
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [step, setStep] = useState(1);
  const [staffSearch, setStaffSearch] = useState('');
  const [form, setForm] = useState({
    staff_id: '',
    profile_role: '',
    notes: '',
    degree: '',
    years_experience: '',
    branch_id: '',
    service_scope: [],
    specialties: [],
    files: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialForm) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        staff_id: initialForm.staff_id || '',
        profile_role: initialForm.profile_role || '',
        notes: initialForm.notes || '',
        degree: initialForm.degree || '',
        years_experience: initialForm.years_experience || '',
        branch_id: initialForm.branch_id || '',
        service_scope: initialForm.service_scope || [],
        specialties: (initialForm.specialties || []).map((s) => s.specialty_name).filter(Boolean),
        files: (initialForm.certificates || []).map((c) => ({
          existing: true,
          name: c.existing_file_name || c.certificate_name,
          size: 0,
          file: null,
          certificate_name: c.certificate_name,
          certificate_number: c.certificate_number,
          certificate_type: c.certificate_type,
          issued_date: c.issued_date,
          expiry_date: c.expiry_date,
          is_primary: c.is_primary,
        })),
      });
    } else {
      setForm({
        staff_id: '',
        profile_role: '',
        notes: '',
        degree: '',
        years_experience: '',
        branch_id: '',
        service_scope: [],
        specialties: [],
        files: [],
      });
    }
    setStep(1);
    setStaffSearch('');
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, initialForm?.id]);

  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    return staffOptions.filter((s) => {
      if (!q) return true;
      return (
        s.full_name?.toLowerCase().includes(q) ||
        s.employee_code?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    });
  }, [staffOptions, staffSearch]);

  const selectedStaff = useMemo(
    () => staffOptions.find((s) => String(s.id) === String(form.staff_id)) || null,
    [staffOptions, form.staff_id]
  );

  const selectedBranch = useMemo(
    () => branches.find((b) => String(b.id) === String(form.branch_id)) || null,
    [branches, form.branch_id]
  );

  const selectedDegreeLabel = useMemo(() => {
    if (!form.degree) return '—';
    const found = degrees.find((d) => d.value === form.degree);
    return found ? found.label : form.degree;
  }, [degrees, form.degree]);

  const handleSelectStaff = (staff) => {
    setForm((prev) => ({
      ...prev,
      staff_id: String(staff.id),
      profile_role: staff.role_slug,
      branch_id: prev.branch_id || (staff.branch_id ? String(staff.branch_id) : ''),
    }));
  };

  const handleAddFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    const next = [];
    const newErrors = {};
    arr.forEach((file) => {
      if (file.size > MAX_BYTES) {
        newErrors.files = `File ${file.name} vượt quá 10MB.`;
        return;
      }
      if (!ALLOWED_MIME.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
        newErrors.files = `File ${file.name} không đúng định dạng (PDF/JPG/PNG).`;
        return;
      }
      next.push({
        existing: false,
        name: file.name,
        size: file.size,
        file,
        certificate_name: file.name.replace(/\.[^.]+$/, ''),
        certificate_number: '',
        certificate_type: 'Tai lieu khac',
        issued_date: '',
        expiry_date: '',
        is_primary: false,
      });
    });
    setForm((prev) => ({ ...prev, files: [...prev.files, ...next] }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
  };

  const removeFile = (index) => {
    setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.staff_id) e.staff_id = 'Vui lòng chọn nhân sự.';
    }
    if (s === 2) {
      if (form.profile_role === 'bac_si') {
        if (!form.specialties.length) e.specialties = 'Vui lòng nhập ít nhất 1 chuyên môn.';
        if (!form.degree) e.degree = 'Vui lòng chọn học vị.';
        if (!form.branch_id) e.branch_id = 'Vui lòng chọn phòng/chi nhánh.';
        if (form.service_scope.length === 0) e.service_scope = 'Vui lòng chọn ít nhất 1 dịch vụ.';
      } else if (form.profile_role === 'ke_toan') {
        if (!form.branch_id) e.branch_id = 'Vui lòng chọn phòng/chi nhánh.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  };
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  const handleSave = async () => {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    const certificates = form.files
      .filter((f) => !f.existing)
      .map((f, idx) => ({
        certificate_type: f.certificate_type || 'Tai lieu khac',
        certificate_name: f.certificate_name || f.name,
        certificate_number: f.certificate_number || `AUTO-${Date.now()}-${idx}`,
        issued_date: f.issued_date || null,
        expiry_date: f.expiry_date || null,
        is_primary: Boolean(f.is_primary),
        file: f.file,
      }));

    const payloadForm = {
      id: initialForm?.id,
      staff_id: form.staff_id,
      profile_role: form.profile_role,
      status: 'pending',
      notes: form.notes,
      degree: form.degree,
      years_experience: form.years_experience,
      branch_id: form.branch_id,
      service_scope: form.service_scope,
      specialties: form.specialties.map((name) => ({
        specialty_name: name,
        degree: form.degree,
        years_experience: Number(form.years_experience || 0),
        service_scope: form.service_scope,
        branch_or_room: selectedBranch?.name || '',
        notes: '',
      })),
      certificates,
    };

    await onSubmit?.(payloadForm);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Chỉnh sửa hồ sơ chuyên môn' : 'Thêm hồ sơ chuyên môn'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bước {step}/4 — {STEPS[step - 1].label}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200">
          <ol className="flex items-center gap-2 text-xs">
            {STEPS.map((s, idx) => {
              const isCurrent = s.id === step;
              const isDone = s.id < step;
              return (
                <li key={s.id} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <span
                    className={`hidden sm:inline ${
                      isCurrent ? 'text-blue-700 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                  {idx < STEPS.length - 1 && <span className="w-6 h-px bg-slate-300 mx-1" />}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 1 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder="Tìm kiếm nhân sự (theo tên, mã NV, email)..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {errors.staff_id && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.staff_id}
                </div>
              )}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredStaff.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8">
                    Không tìm thấy nhân sự phù hợp.
                  </div>
                ) : (
                  filteredStaff.map((staff) => (
                    <StaffOption
                      key={staff.id}
                      staff={staff}
                      checked={String(staff.id) === String(form.staff_id)}
                      onChange={handleSelectStaff}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {selectedStaff && (
                <div className="rounded-md bg-blue-50 border border-blue-100 p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border flex items-center justify-center text-xs font-medium text-slate-600">
                    {initialOf(selectedStaff.full_name)}
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-slate-800">{selectedStaff.full_name}</div>
                    <div className="text-slate-500">
                      {selectedStaff.role_slug === 'bac_si' ? 'Hồ sơ Bác sĩ' : 'Hồ sơ Kế toán'} ·{' '}
                      {selectedStaff.employee_code}
                    </div>
                  </div>
                </div>
              )}

              {form.profile_role === 'bac_si' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Chuyên khoa / Chuyên môn <span className="text-red-500">*</span>
                    </label>
                    <TagInput
                      value={form.specialties}
                      onChange={(value) => setForm((p) => ({ ...p, specialties: value }))}
                      placeholder="Vd: Răng Hàm Mặt, Implant…"
                      suggestions={['Răng Hàm Mặt', 'Implant', 'Niềng răng', 'Nha chu', 'Nội nha']}
                    />
                    {errors.specialties && (
                      <div className="text-xs text-red-600 mt-1">{errors.specialties}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Học vị <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.degree}
                        onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Chọn --</option>
                        {degrees.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      {errors.degree && (
                        <div className="text-xs text-red-600 mt-1">{errors.degree}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Kinh nghiệm (năm)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={80}
                        value={form.years_experience}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, years_experience: e.target.value }))
                        }
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Vd: 8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Dịch vụ được phép thực hiện <span className="text-red-500">*</span>
                    </label>
                    <TagInput
                      value={form.service_scope}
                      onChange={(value) => setForm((p) => ({ ...p, service_scope: value }))}
                      placeholder="Chọn dịch vụ từ gợi ý hoặc nhập..."
                      suggestions={services.map((s) => s.name)}
                    />
                    {errors.service_scope && (
                      <div className="text-xs text-red-600 mt-1">{errors.service_scope}</div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phòng / Chi nhánh <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.branch_id}
                  onChange={(e) => setForm((p) => ({ ...p, branch_id: e.target.value }))}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.branch_id && (
                  <div className="text-xs text-red-600 mt-1">{errors.branch_id}</div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ghi chú nội bộ..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <label className="block border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleAddFiles(e.target.files)}
                />
                <Upload className="w-8 h-8 mx-auto text-slate-400" />
                <div className="text-sm text-slate-700 mt-2">
                  Kéo thả file vào đây, hoặc <span className="text-blue-600 font-medium">chọn từ máy</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Định dạng: PDF, JPG, PNG · Tối đa 10MB / file
                </div>
              </label>

              {errors.files && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.files}
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  Danh sách tài liệu ({form.files.length})
                </h4>
                {form.files.length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded">
                    Chưa có tài liệu đính kèm.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {form.files.map((f, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 p-2 border border-slate-200 rounded bg-white"
                      >
                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {f.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {f.existing ? 'Đã tải lên trước đó' : formatBytes(f.size)}
                          </div>
                        </div>
                        {!f.existing && (
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Sau khi lưu, hồ sơ sẽ được chuyển sang trạng thái <strong>Chờ duyệt</strong>.
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Nhân sự</dt>
                  <dd className="font-medium text-slate-800">
                    {selectedStaff?.full_name || '—'}{' '}
                    <span className="text-xs text-slate-500">
                      ({selectedStaff?.employee_code})
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Loại hồ sơ</dt>
                  <dd className="font-medium text-slate-800">
                    {form.profile_role === 'bac_si'
                      ? 'Hồ sơ Bác sĩ'
                      : form.profile_role === 'ke_toan'
                      ? 'Hồ sơ Kế toán'
                      : '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Chuyên khoa / Chuyên môn</dt>
                  <dd className="font-medium text-slate-800">
                    {form.specialties.length ? form.specialties.join(', ') : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Học vị</dt>
                  <dd className="font-medium text-slate-800">{selectedDegreeLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Kinh nghiệm</dt>
                  <dd className="font-medium text-slate-800">
                    {form.years_experience ? `${form.years_experience} năm` : '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Dịch vụ được phép thực hiện</dt>
                  <dd className="font-medium text-slate-800">
                    {form.service_scope.length ? form.service_scope.join(', ') : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Phòng / Chi nhánh</dt>
                  <dd className="font-medium text-slate-800">{selectedBranch?.name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Số tài liệu đính kèm</dt>
                  <dd className="font-medium text-slate-800">{form.files.length}</dd>
                </div>
                {form.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-500">Ghi chú</dt>
                    <dd className="text-slate-800 whitespace-pre-wrap">{form.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || submitting}
            className="px-3 py-1.5 rounded-md text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 rounded-md text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 text-sm"
            >
              Huỷ
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm flex items-center gap-1"
              >
                Tiếp theo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="px-4 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm flex items-center gap-1 disabled:opacity-60"
              >
                <Plus className="w-4 h-4" /> {submitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
