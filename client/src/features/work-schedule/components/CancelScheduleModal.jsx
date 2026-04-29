import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fmtVnDate, trimTime } from '../utils';

const CancelScheduleModal = ({ open, schedule, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open || !schedule) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSaving(true);
    try {
      const ok = await onConfirm(schedule.id, reason);
      if (ok) {
        setReason('');
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-xl p-0 overflow-hidden border shadow-xl">
        <div className="px-6 py-4 border-b bg-red-50">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-red-700">Hủy ca làm việc</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={submit} className="p-6 space-y-3 text-xs">
          <div className="bg-gray-50 border rounded p-3 space-y-1">
            <div><strong>Nhân sự:</strong> {schedule.staff?.full_name}</div>
            <div><strong>Ngày:</strong> {fmtVnDate(schedule.work_date)}</div>
            <div><strong>Giờ:</strong> {trimTime(schedule.start_time)} - {trimTime(schedule.end_time)}</div>
          </div>
          <p className="text-gray-500">
            Nếu ca này đã có lịch khám hoặc bệnh nhân đặt lịch, hệ thống sẽ chặn việc hủy (E7).
          </p>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Lý do hủy <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Bắt buộc..."
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border rounded text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={saving || !reason.trim()}
              className="px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Đang hủy...' : 'Xác nhận hủy'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CancelScheduleModal;
