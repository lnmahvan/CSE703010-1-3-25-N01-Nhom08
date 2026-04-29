import React from 'react';
import { SHIFT_COLORS } from '../constants';
import { trimTime } from '../utils';

const labelOf = (code) => {
  switch (code) {
    case 'morning': return 'Sáng';
    case 'afternoon': return 'Chiều';
    case 'evening': return 'Tối';
    default: return 'Tùy chỉnh';
  }
};

const ShiftBlock = ({ schedule, isSelected, onClick }) => {
  const code = schedule.shift_template?.code || 'custom';
  const color = SHIFT_COLORS[code] || SHIFT_COLORS.custom;
  const branchName = schedule.branch?.name || schedule.room || '';
  const isCancelled = schedule.status === 'cancelled';
  const hasPendingRequest = (schedule.leave_requests?.some?.((r) => r.status === 'pending'))
    || (schedule.swap_requests?.some?.((r) => r.status === 'pending'));

  return (
    <button
      type="button"
      onClick={() => onClick(schedule.id)}
      className={`w-full text-left ${color.bg} ${color.text} rounded-md p-1.5 flex flex-col gap-0.5 leading-tight border ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-transparent'
      } ${isCancelled ? 'opacity-50 line-through' : ''} hover:brightness-95 transition relative`}
    >
      {hasPendingRequest && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
      )}
      <span className="font-semibold text-[11px]">{labelOf(code)}</span>
      <span className="text-[11px]">
        {trimTime(schedule.start_time)} - {trimTime(schedule.end_time)}
      </span>
      {branchName && <span className="text-[10px] truncate">{branchName}</span>}
    </button>
  );
};

export default ShiftBlock;
