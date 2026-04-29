import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { REQUEST_STATUS_BADGE, REQUEST_STATUS_LABEL } from '../constants';
import { fmtVnDate, trimTime } from '../utils';

const RequestRow = ({ children }) => (
  <div className="flex items-start justify-between border-b pb-2 last:border-b-0 gap-2">
    {children}
  </div>
);

const PendingRequestsPanel = ({
  leaveRequests,
  swapRequests,
  isAdmin,
  onApproveLeave,
  onRejectLeave,
  onApproveSwap,
  onRejectSwap,
}) => {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectingType, setRejectingType] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const total = (leaveRequests?.length || 0) + (swapRequests?.length || 0);

  const submitReject = async () => {
    if (!rejectNote.trim()) return;
    if (rejectingType === 'leave') {
      await onRejectLeave(rejectingId, rejectNote);
    } else {
      await onRejectSwap(rejectingId, rejectNote);
    }
    setRejectingId(null);
    setRejectingType(null);
    setRejectNote('');
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
      <div className="px-4 py-3 flex justify-between items-center border-b">
        <h2 className="font-semibold text-gray-800">Yêu cầu chờ xử lý</h2>
        <span className="text-xs text-gray-500">{total} yêu cầu</span>
      </div>
      <div className="p-3 overflow-y-auto space-y-2 max-h-[420px]">
        {total === 0 && (
          <div className="text-center text-xs text-gray-400 py-6">
            Không có yêu cầu nào đang chờ.
          </div>
        )}

        {leaveRequests?.map((req) => (
          <RequestRow key={`leave-${req.id}`}>
            <div className="flex gap-2 items-start">
              <span className="px-2 py-0.5 rounded text-[11px] border bg-purple-100 text-purple-700 border-purple-200 mt-0.5">
                Nghỉ phép
              </span>
              <div className="text-xs">
                <div className="font-medium text-gray-800">{req.staff?.full_name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {fmtVnDate(req.work_schedule?.work_date)} ({trimTime(req.work_schedule?.start_time)} - {trimTime(req.work_schedule?.end_time)})
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Lý do: {req.reason}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded text-[11px] border ${REQUEST_STATUS_BADGE[req.status]}`}>
                {REQUEST_STATUS_LABEL[req.status]}
              </span>
              {isAdmin && req.status === 'pending' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onApproveLeave(req.id, null)}
                    className="text-green-600 hover:bg-green-50 p-1 rounded border border-green-200"
                    title="Duyệt"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => { setRejectingId(req.id); setRejectingType('leave'); }}
                    className="text-red-600 hover:bg-red-50 p-1 rounded border border-red-200"
                    title="Từ chối"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </RequestRow>
        ))}

        {swapRequests?.map((req) => (
          <RequestRow key={`swap-${req.id}`}>
            <div className="flex gap-2 items-start">
              <span className="px-2 py-0.5 rounded text-[11px] border bg-blue-100 text-blue-700 border-blue-200 mt-0.5">
                Đổi ca
              </span>
              <div className="text-xs">
                <div className="font-medium text-gray-800">
                  {req.requester_staff?.full_name} ⇄ {req.target_staff?.full_name}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {fmtVnDate(req.requester_schedule?.work_date)} ({trimTime(req.requester_schedule?.start_time)} - {trimTime(req.requester_schedule?.end_time)})
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded text-[11px] border ${REQUEST_STATUS_BADGE[req.status]}`}>
                {REQUEST_STATUS_LABEL[req.status]}
              </span>
              {isAdmin && req.status === 'pending' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onApproveSwap(req.id, null)}
                    className="text-green-600 hover:bg-green-50 p-1 rounded border border-green-200"
                    title="Duyệt"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => { setRejectingId(req.id); setRejectingType('swap'); }}
                    className="text-red-600 hover:bg-red-50 p-1 rounded border border-red-200"
                    title="Từ chối"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </RequestRow>
        ))}
      </div>

      {rejectingId && (
        <div className="border-t p-3 bg-red-50/30">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Lý do từ chối <span className="text-red-500">*</span>
          </label>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={2}
            className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Bắt buộc nhập (E10)..."
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => { setRejectingId(null); setRejectingType(null); setRejectNote(''); }}
              className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={submitReject}
              disabled={!rejectNote.trim()}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
            >
              Xác nhận từ chối
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsPanel;
