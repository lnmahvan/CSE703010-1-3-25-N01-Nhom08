import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { startOfIsoWeek, toYmd } from '../utils';

const computeDefaults = (defaultSourceDate) => {
  const todayMon = toYmd(startOfIsoWeek(new Date()));
  const source = defaultSourceDate ? toYmd(startOfIsoWeek(defaultSourceDate)) : todayMon;
  const sourceDate = defaultSourceDate ? new Date(defaultSourceDate) : new Date();
  const destDate = new Date(sourceDate.getTime() + 7 * 24 * 3600 * 1000);
  const dest = toYmd(startOfIsoWeek(destDate));
  return { source, dest };
};

const CopyWeekModal = ({ open, defaultSourceDate, onClose, onConfirm }) => {
  const [sourceFrom, setSourceFrom] = useState(() => computeDefaults(defaultSourceDate).source);
  const [destFrom, setDestFrom] = useState(() => computeDefaults(defaultSourceDate).dest);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = computeDefaults(defaultSourceDate);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSourceFrom(next.source);
    setDestFrom(next.dest);
  }, [open, defaultSourceDate]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await onConfirm(sourceFrom, destFrom);
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-xl p-0 overflow-hidden border shadow-xl">
        <div className="px-6 py-4 border-b bg-slate-50">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-800">Sao chép lịch làm việc</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4 text-xs">
          <p className="text-gray-500">
            Sao chép tất cả lịch ca từ một tuần nguồn sang tuần đích. Hệ thống sẽ kiểm tra xung đột (E1, E5)
            và bỏ qua các ca không hợp lệ.
          </p>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">Tuần nguồn (Thứ 2)</label>
            <input
              type="date"
              required
              value={sourceFrom}
              onChange={(e) => setSourceFrom(e.target.value)}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">Tuần đích (Thứ 2)</label>
            <input
              type="date"
              required
              value={destFrom}
              onChange={(e) => setDestFrom(e.target.value)}
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
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang sao chép...' : 'Sao chép'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CopyWeekModal;
