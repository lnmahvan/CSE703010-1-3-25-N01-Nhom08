import React, { useEffect, useState } from 'react';
import SpecialtySelector from './SpecialtySelector';
import { FORM_STEPS } from '../constants';
import { buildEmptyForm, toFormState } from '../utils';

const stepCircleClass = (idx, current) => {
  if (idx < current) return 'bg-green-600 text-white border-none';
  if (idx === current) return 'bg-blue-600 text-white border-none';
  return 'border border-gray-300 text-gray-400';
};

const ServiceFormModal = ({
  open,
  initial,
  groups,
  specialties,
  onClose,
  onSubmit,
  saving,
  error,
}) => {
  const isEdit = Boolean(initial?.id);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(buildEmptyForm());

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(0);
      setForm(initial?.id ? toFormState(initial) : buildEmptyForm());
    }
  }, [open, initial]);

  if (!open) return null;

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const setField = (key) => (e) => update({ [key]: e.target.value });

  const next = () => setStep((s) => Math.min(FORM_STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const submit = async (status) => {
    const payload = {
      ...form,
      status,
      service_group_id: form.service_group_id || null,
      price: form.price === '' ? 0 : Number(form.price),
      duration_minutes: form.duration_minutes === '' ? null : Number(form.duration_minutes),
      commission_rate: form.commission_rate === '' ? 0 : Number(form.commission_rate),
      specialty_ids: form.specialty_ids,
      primary_specialty_id: form.primary_specialty_id || null,
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl flex flex-col max-h-[92vh]">
        <div className="px-4 py-3 flex justify-between items-center border-b">
          <h2 className="font-semibold text-gray-800 text-sm">
            {isEdit ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="px-4 py-3 flex justify-between items-center border-b text-[11px]">
          {FORM_STEPS.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${stepCircleClass(
                  idx,
                  step
                )}`}
              >
                {idx < step ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[10px] text-center ${
                  idx === step ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 flex-1 overflow-auto text-xs">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 mb-1 block">Mã dịch vụ</label>
                <input
                  type="text"
                  value={form.service_code}
                  onChange={setField('service_code')}
                  placeholder="Tự sinh nếu để trống"
                  className="w-full border rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label className="text-gray-500 mb-1 block">
                  Nhóm dịch vụ <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.service_group_id}
                  onChange={setField('service_group_id')}
                  className="w-full border rounded px-2 py-1.5"
                >
                  <option value="">Chọn nhóm</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-gray-500 mb-1 block">
                  Tên dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={setField('name')}
                  className="w-full border rounded px-2 py-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-gray-500 mb-1 block">Mô tả</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={setField('description')}
                  className="w-full border rounded px-2 py-1.5"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-500 mb-1 block">Giá (đ)</label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={setField('price')}
                  className="w-full border rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label className="text-gray-500 mb-1 block">Thời lượng (phút)</label>
                <input
                  type="number"
                  min={0}
                  max={1440}
                  value={form.duration_minutes}
                  onChange={setField('duration_minutes')}
                  className="w-full border rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label className="text-gray-500 mb-1 block">Hoa hồng (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.commission_rate}
                  onChange={setField('commission_rate')}
                  className="w-full border rounded px-2 py-1.5"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <SpecialtySelector
              specialties={specialties}
              value={form.specialty_ids}
              primaryId={form.primary_specialty_id}
              onChange={(ids) => update({ specialty_ids: ids })}
              onPrimaryChange={(id) => update({ primary_specialty_id: id })}
            />
          )}

          {step === 3 && (
            <div className="text-gray-500 text-[12px]">
              Sau khi lưu, bạn có thể quản lý tệp đính kèm trong tab “Hình ảnh & tài liệu” của
              chi tiết dịch vụ.
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 mb-1 block">
                  Phạm vi hiển thị <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.visibility}
                  onChange={setField('visibility')}
                  className="w-full border rounded px-2 py-1.5"
                >
                  <option value="internal">Nội bộ</option>
                  <option value="public">Công khai (cho bệnh nhân)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-gray-500 mb-1 block">Ghi chú</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={setField('notes')}
                  className="w-full border rounded px-2 py-1.5"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t flex justify-between bg-gray-50 text-xs">
          <button
            type="button"
            onClick={step === 0 ? onClose : prev}
            className="px-4 py-1.5 border rounded hover:bg-gray-100 bg-white"
            disabled={saving}
          >
            {step === 0 ? 'Huỷ' : 'Quay lại'}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => submit('draft')}
              disabled={saving}
              className="px-4 py-1.5 border rounded hover:bg-gray-100 bg-white text-gray-600"
            >
              Lưu nháp
            </button>
            {step < FORM_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={saving}
                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tiếp tục
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submit('active')}
                disabled={saving}
                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isEdit ? 'Cập nhật & Áp dụng' : 'Tạo & Áp dụng'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;
