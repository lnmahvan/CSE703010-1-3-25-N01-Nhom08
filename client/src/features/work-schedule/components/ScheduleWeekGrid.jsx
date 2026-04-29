import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { computeIsoWeekNumber, fmtVnDate, groupSchedulesByStaffAndDate, toYmd } from '../utils';
import { ROLE_LABEL, WEEKDAY_LABEL } from '../constants';
import ShiftBlock from './ShiftBlock';

const ScheduleWeekGrid = ({
  weekDays,
  schedules,
  selectedScheduleId,
  onSelectSchedule,
  onPrev,
  onToday,
  onNext,
  loading,
}) => {
  const start = weekDays[0];
  const end = weekDays[6];
  const weekNum = computeIsoWeekNumber(start);

  const grouped = useMemo(
    () => groupSchedulesByStaffAndDate(schedules, weekDays),
    [schedules, weekDays]
  );

  // Group rows by role
  const rowsByRole = useMemo(() => {
    const map = new Map();
    grouped.forEach((row) => {
      const role = row.staff?.role_slug || 'other';
      if (!map.has(role)) map.set(role, []);
      map.get(role).push(row);
    });
    return Array.from(map.entries());
  }, [grouped]);

  return (
    <div className="flex-1 bg-white border rounded-lg shadow-sm flex flex-col min-w-0">
      <div className="p-3 border-b flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-1 text-xs">
          <button onClick={onPrev} className="p-1.5 border rounded hover:bg-gray-100 bg-white">
            <ChevronLeft size={14} />
          </button>
          <button onClick={onToday} className="px-3 py-1 border rounded hover:bg-gray-100 bg-white font-medium text-gray-700">
            Hôm nay
          </button>
          <button onClick={onNext} className="p-1.5 border rounded hover:bg-gray-100 bg-white">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="font-bold text-gray-800 text-sm">
          {fmtVnDate(start)} - {fmtVnDate(end)} (Tuần {weekNum})
        </div>
        <div className="w-[100px] text-right text-xs text-gray-400">
          {loading ? 'Đang tải...' : ''}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="text-center text-xs text-gray-500 border-b">
              <th className="p-2 border-r text-left w-56 sticky left-0 bg-white z-20">
                Nhân sự
              </th>
              {weekDays.map((d) => {
                const dayIdx = d.getDay();
                const isSunday = dayIdx === 0;
                return (
                  <th
                    key={toYmd(d)}
                    className={`p-2 border-r font-medium ${
                      isSunday ? 'text-red-500 bg-red-50/30' : ''
                    }`}
                  >
                    {WEEKDAY_LABEL[dayIdx]}<br />
                    <span className="font-normal">
                      {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rowsByRole.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400 text-sm">
                  Chưa có lịch làm việc nào trong khoảng thời gian này.
                </td>
              </tr>
            )}
            {rowsByRole.map(([role, rows]) => (
              <React.Fragment key={role}>
                <tr className="bg-gray-50 border-b">
                  <td colSpan={8} className="px-3 py-1.5 text-[11px] font-bold text-gray-700 sticky left-0 bg-gray-50">
                    {ROLE_LABEL[role] || role}
                  </td>
                </tr>
                {rows.map((row) => (
                  <tr key={row.staff.id} className="border-b hover:bg-gray-50/50">
                    <td className="p-2 border-r sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-gray-500">
                          {(row.staff.full_name || '?').slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-[12px] truncate">
                            {row.staff.full_name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {row.staff.employee_code || ROLE_LABEL[role] || role}
                          </div>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((d) => {
                      const key = toYmd(d);
                      const cells = row.cells[key] || [];
                      return (
                        <td key={key} className="p-1 border-r align-top min-w-[110px]">
                          {cells.length === 0 ? (
                            <div className="text-center text-gray-300 text-xs py-2">Nghỉ</div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {cells.map((s) => (
                                <ShiftBlock
                                  key={s.id}
                                  schedule={s}
                                  isSelected={s.id === selectedScheduleId}
                                  onClick={onSelectSchedule}
                                />
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleWeekGrid;
