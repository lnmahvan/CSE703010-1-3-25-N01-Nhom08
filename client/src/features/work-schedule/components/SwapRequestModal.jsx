import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import workScheduleApi from '@/api/workScheduleApi';
import { fmtVnDate, trimTime } from '../utils';

const SwapRequestModal = ({ open, schedule, staffList, onClose, onSuccess, toast }) => {
  const [targetStaffId, setTargetStaffId] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open || !schedule) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!targetStaffId) return;
    setSaving(true);
    try {
      await workScheduleApi.createSwapRequest({
        requester_schedule_id: schedule.id,
        target_staff_id: Number(targetStaffId),
        reason: reason || null,
      });
      toast?.({ title: 'Đã gửi yêu cầu đổi ca' });
      setTargetStaffId('');
      setReason('');
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const description = data?.errors
        ? Object.values(data.errors).flat().join(' • ')
        : data?.message || err.message;
      toast?.({ title: 'Không thể gửi yêu cầu', description, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const otherStaff = staffList.filter(
    (s) => s.id !== schedule.staff_id && s.status === 'working'
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-xl p-0 overflow-hidden border shadow-xl">
        <div className="px-6 py-4 border-b bg-blue-50">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-blue-700">Yêu cầu đổi ca</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={submit} className="p-6 space-y-3 text-xs">
          <div className="bg-gray-50 border rounded p-3 space-y-1">
            <div><strong>Ca của bạn:</strong> {fmtVnDate(schedule.work_date)} {trimTime(schedule.start_time)} - {trimTime(schedule.end_time)}</div>
            <div><strong>Chi nhánh:</strong> {schedule.branch?.name || '—'}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Đổi với nhân sự <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={targetStaffId}
              onChange={(e) => setTargetStaffId(e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Chọn nhân sự --</option>
              {otherStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} · {s.role_slug}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Ghi chú</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border rounded text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || !targetStaffId}
              className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SwapRequestModal;
