import React, { useEffect, useState } from 'react';
import { STATUS_LABELS } from '../constants';

const STATUSES = ['draft', 'active', 'hidden', 'discontinued'];

const StatusChangeModal = ({ open, currentStatus, onClose, onConfirm }) => {
  const [next, setNext] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNext('');
      setReason('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!next || next === currentStatus) {
      setError('Vui lòng chọn trạng thái mới khác trạng thái hiện tại.');
      return;
    }
    if ((next === 'hidden' || next === 'discontinued') && reason.trim().length < 3) {
      setError('Vui lòng nhập lý do (ít nhất 3 ký tự).');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(next, reason);
    } catch (err) {
      setError(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">Đổi trạng thái dịch vụ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <div className="p-4 space-y-3 text-xs">
          <div>
            <label className="text-gray-500 mb-1 block">
              Trạng thái mới <span className="text-red-500">*</span>
            </label>
            <select
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="w-full border rounded px-2 py-1.5"
            >
              <option value="">Chọn trạng thái</option>
              {STATUSES.filter((s) => s !== currentStatus).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-500 mb-1 block">Lý do</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-2 py-1.5"
              placeholder="Nhập lý do đổi trạng thái"
            />
          </div>
          {error && <div className="text-red-600">{error}</div>}
        </div>
        <div className="px-4 py-3 border-t flex justify-end gap-2 text-xs bg-gray-50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-3 py-1.5 border rounded bg-white hover:bg-gray-100"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
