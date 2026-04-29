import React from 'react';
import { trimTime } from '../utils';

const COLORS = {
  morning: 'bg-green-400',
  afternoon: 'bg-blue-400',
  evening: 'bg-orange-400',
  custom: 'bg-purple-400',
};

const StandardShiftsCard = ({ templates }) => (
  <div className="bg-white border rounded-lg shadow-sm p-4 flex gap-4">
    <div className="flex-1">
      <h3 className="font-semibold text-gray-800 mb-3 text-[13px]">Ca làm việc chuẩn</h3>
      <div className="space-y-2 text-xs text-gray-700">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${COLORS[t.code] || 'bg-gray-400'}`} />
            <strong>{t.name}:</strong> {trimTime(t.start_time)} - {trimTime(t.end_time)}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-400" />
          <strong className="text-gray-500">Tùy chỉnh:</strong> Tạo khung giờ linh hoạt
        </div>
      </div>
    </div>
    <div className="w-px bg-gray-200" />
    <div className="flex-1 text-[11px] text-gray-500 flex flex-col justify-center gap-2">
      <p>Một nhân sự có thể làm nhiều ca/ngày nhưng không trùng thời gian.</p>
      <p>Tổng số giờ làm việc tối đa:<br />- 1 ngày: 12 giờ<br />- 1 tuần: 60 giờ</p>
    </div>
  </div>
);

export default StandardShiftsCard;
