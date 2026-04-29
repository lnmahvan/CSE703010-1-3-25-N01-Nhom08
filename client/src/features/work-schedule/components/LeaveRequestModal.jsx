import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import workScheduleApi from '@/api/workScheduleApi';
import { fmtVnDate, trimTime } from '../utils';

const LeaveRequestModal = ({ open, schedule, onClose, onSuccess, toast }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open || !schedule) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSaving(true);
    try {
      await workScheduleApi.createLeaveRequest({
        work_schedule_id: schedule.id,
        reason,
      });
      toast?.({ title: 'Đã gửi yêu cầu nghỉ phép', description: 'Yêu cầu đang chờ admin duyệt.' });
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-xl p-0 overflow-hidden border shadow-xl">
        <div className="px-6 py-4 border-b bg-purple-50">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-purple-700">Yêu cầu nghỉ phép</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={submit} className="p-6 space-y-3 text-xs">
          <div className="bg-gray-50 border rounded p-3 space-y-1">
            <div><strong>Ca:</strong> {fmtVnDate(schedule.work_date)} {trimTime(schedule.start_time)} - {trimTime(schedule.end_time)}</div>
            <div><strong>Chi nhánh:</strong> {schedule.branch?.name || '—'}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Lý do nghỉ <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Mô tả lý do..."
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
              disabled={saving || !reason.trim()}
              className="px-4 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRequestModal;
