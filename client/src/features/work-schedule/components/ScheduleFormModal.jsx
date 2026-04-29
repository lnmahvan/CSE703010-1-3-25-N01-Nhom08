import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WORK_ROLE_OPTIONS } from '../constants';
import { toYmd, trimTime } from '../utils';

const emptyForm = {
  staff_id: '',
  branch_id: '',
  shift_template_id: '',
  work_date: toYmd(new Date()),
  start_time: '',
  end_time: '',
  work_role: '',
  room: '',
  notes: '',
  status: 'scheduled',
};

const ScheduleFormModal = ({
  open,
  isEditing,
  initialData,
  staffList,
  branches,
  templates,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isEditing && initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        staff_id: initialData.staff_id || '',
        branch_id: initialData.branch_id || '',
        shift_template_id: initialData.shift_template_id || '',
        work_date: toYmd(initialData.work_date),
        start_time: trimTime(initialData.start_time),
        end_time: trimTime(initialData.end_time),
        work_role: initialData.work_role || '',
        room: initialData.room || '',
        notes: initialData.notes || '',
        status: initialData.status || 'scheduled',
      });
    } else {
      setForm({ ...emptyForm, work_date: initialData?.work_date || emptyForm.work_date });
    }
  }, [open, isEditing, initialData]);

  const selectedStaff = useMemo(
    () => staffList.find((s) => String(s.id) === String(form.staff_id)),
    [staffList, form.staff_id]
  );

  const filteredRoles = useMemo(() => {
    if (!selectedStaff) return WORK_ROLE_OPTIONS;
    return WORK_ROLE_OPTIONS.filter((r) => r.roles.includes(selectedStaff.role_slug));
  }, [selectedStaff]);

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'shift_template_id' && value) {
        const tpl = templates.find((t) => String(t.id) === String(value));
        if (tpl) {
          next.start_time = trimTime(tpl.start_time);
          next.end_time = trimTime(tpl.end_time);
        }
      }
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      ['staff_id', 'branch_id', 'shift_template_id'].forEach((k) => {
        if (payload[k] === '' || payload[k] === null) delete payload[k];
        else if (k !== 'work_date') payload[k] = Number(payload[k]) || payload[k];
      });
      if (!payload.start_time) delete payload.start_time;
      if (!payload.end_time) delete payload.end_time;

      const ok = await onSubmit(payload);
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-xl p-0 overflow-hidden border shadow-xl">
        <div className="px-6 py-4 border-b bg-slate-50">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-800">
              {isEditing ? 'Cập nhật lịch làm việc' : 'Tạo lịch làm việc'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto text-xs">
          <div className="col-span-2">
            <label className="block text-gray-600 mb-1 font-medium">
              Nhân sự <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={isEditing}
              value={form.staff_id}
              onChange={(e) => handleChange('staff_id', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Chọn nhân sự --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} · {s.role_slug} · {s.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.work_date}
              onChange={(e) => handleChange('work_date', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">Ca chuẩn</label>
            <select
              value={form.shift_template_id}
              onChange={(e) => handleChange('shift_template_id', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tùy chỉnh giờ</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({trimTime(t.start_time)} - {trimTime(t.end_time)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Giờ bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={form.start_time}
              onChange={(e) => handleChange('start_time', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Giờ kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={form.end_time}
              onChange={(e) => handleChange('end_time', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">Chi nhánh</label>
            <select
              value={form.branch_id}
              onChange={(e) => handleChange('branch_id', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Không gán --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">Phòng / Khu vực</label>
            <input
              type="text"
              value={form.room}
              onChange={(e) => handleChange('room', e.target.value)}
              placeholder="VD: PK1, Phòng kế toán..."
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-600 mb-1 font-medium">
              Vai trò công việc <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.work_role}
              onChange={(e) => handleChange('work_role', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Chọn vai trò --</option>
              {filteredRoles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {selectedStaff?.role_slug === 'bac_si' && (
              <p className="text-[10px] text-gray-500 mt-1">
                Chỉ hiển thị vai trò phù hợp chuyên môn bác sĩ (E4).
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-gray-600 mb-1 font-medium">Ghi chú</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-600 mb-1 font-medium">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="scheduled">Đã lên lịch</option>
              <option value="confirmed">Đã xác nhận</option>
            </select>
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border rounded text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu lịch làm việc'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleFormModal;
