import React from 'react';
import { Calendar, Clock, MapPin, User, Tag, FileText, X, Pencil, Trash2, RefreshCw, Coffee } from 'lucide-react';
import { SCHEDULE_STATUS_BADGE, SCHEDULE_STATUS_LABEL } from '../constants';
import { fmtVnDate, fmtVnDateTime, trimTime, diffHours } from '../utils';

const Row = ({ icon, label, children }) => (
  <div className="flex gap-3 items-start text-xs">
    <span className="text-gray-400 w-5 flex justify-center pt-0.5">{icon}</span>
    <div className="flex-1">
      <div className="text-gray-500 mb-0.5">{label}</div>
      <div className="text-gray-800">{children}</div>
    </div>
  </div>
);

const computeIsPast = (schedule) => {
  if (!schedule?.work_date || !schedule?.end_time) return false;
  const dateStr = String(schedule.work_date).slice(0, 10);
  const end = new Date(`${dateStr}T${schedule.end_time}`);
  return Number.isFinite(end.getTime()) ? end.getTime() < Date.now() : false;
};

const ScheduleDetailPanel = ({
  schedule,
  isAdmin,
  onClose,
  onEdit,
  onCancel,
  onLeaveRequest,
  onSwapRequest,
}) => {
  if (!schedule) {
    return (
      <div className="bg-white border rounded-lg shadow-sm p-6 text-center text-xs text-gray-400">
        Chọn một ca làm việc để xem chi tiết.
      </div>
    );
  }

  const hours = diffHours(schedule.start_time, schedule.end_time);
  const isPast = computeIsPast(schedule);

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="px-4 py-3 flex justify-between items-center border-b">
        <h2 className="font-semibold text-gray-800">Chi tiết ca làm việc</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              {(schedule.staff?.full_name || '?').slice(0, 1)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{schedule.staff?.full_name}</h3>
              <p className="text-gray-500 text-xs">{schedule.staff?.role_slug}</p>
            </div>
          </div>
          <span className={`badge px-2 py-0.5 rounded text-[11px] border ${SCHEDULE_STATUS_BADGE[schedule.status] || ''}`}>
            {SCHEDULE_STATUS_LABEL[schedule.status] || schedule.status}
          </span>
        </div>

        <div className="space-y-2 text-xs mt-2">
          <Row icon={<Calendar size={14} />} label="Ngày">{fmtVnDate(schedule.work_date)}</Row>
          <Row icon={<Clock size={14} />} label="Giờ">
            {trimTime(schedule.start_time)} - {trimTime(schedule.end_time)} ({hours} giờ)
          </Row>
          <Row icon={<MapPin size={14} />} label="Chi nhánh / Phòng">
            {schedule.branch?.name || '—'} {schedule.room ? `· ${schedule.room}` : ''}
          </Row>
          <Row icon={<User size={14} />} label="Vai trò">{schedule.work_role}</Row>
          <Row icon={<Tag size={14} />} label="Ca chuẩn">
            {schedule.shift_template?.name || 'Tùy chỉnh'}
          </Row>
          {schedule.notes && (
            <Row icon={<FileText size={14} />} label="Ghi chú">{schedule.notes}</Row>
          )}
          {schedule.cancel_reason && (
            <Row icon={<Trash2 size={14} />} label="Lý do hủy">{schedule.cancel_reason}</Row>
          )}
          <Row icon={<User size={14} />} label="Tạo bởi">
            {schedule.creator?.name || '—'}
          </Row>
          <Row icon={<Clock size={14} />} label="Cập nhật">
            {fmtVnDateTime(schedule.updated_at)}
          </Row>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {isAdmin && !isPast && schedule.status !== 'cancelled' && (
            <button onClick={() => onEdit(schedule)} className="py-1.5 border rounded text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center justify-center gap-1">
              <Pencil size={12} /> Chỉnh sửa
            </button>
          )}
          {!isPast && schedule.status !== 'cancelled' && (
            <button onClick={() => onLeaveRequest(schedule)} className="py-1.5 border rounded text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center justify-center gap-1">
              <Coffee size={12} /> Yêu cầu nghỉ phép
            </button>
          )}
          {!isPast && schedule.status !== 'cancelled' && (
            <button onClick={() => onSwapRequest(schedule)} className="py-1.5 border rounded text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center justify-center gap-1">
              <RefreshCw size={12} /> Yêu cầu đổi ca
            </button>
          )}
          {isAdmin && !isPast && schedule.status !== 'cancelled' && (
            <button
              onClick={() => onCancel(schedule)}
              className="py-1.5 border border-red-200 rounded text-red-600 bg-red-50 hover:bg-red-100 text-xs font-medium flex items-center justify-center gap-1"
            >
              <Trash2 size={12} /> Hủy lịch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailPanel;
