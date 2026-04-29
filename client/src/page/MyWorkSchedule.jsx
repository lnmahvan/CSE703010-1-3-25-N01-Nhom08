import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import workScheduleApi from '@/api/workScheduleApi';
import { useToast } from '@/hooks/use-toast';
import {
  buildWeekDays,
  computeIsoWeekNumber,
  fmtVnDate,
  startOfIsoWeek,
  toYmd,
  trimTime,
  groupSchedulesByStaffAndDate,
} from '@/features/work-schedule/utils';
import {
  SCHEDULE_STATUS_BADGE,
  SCHEDULE_STATUS_LABEL,
  WEEKDAY_LABEL,
} from '@/features/work-schedule/constants';
import LeaveRequestModal from '@/features/work-schedule/components/LeaveRequestModal';
import SwapRequestModal from '@/features/work-schedule/components/SwapRequestModal';
import ShiftBlock from '@/features/work-schedule/components/ShiftBlock';

const MyWorkSchedule = () => {
  const { toast } = useToast();
  const [anchor, setAnchor] = useState(() => startOfIsoWeek(new Date()));
  const weekDays = useMemo(() => buildWeekDays(anchor), [anchor]);
  const weekFrom = useMemo(() => toYmd(weekDays[0]), [weekDays]);
  const weekTo = useMemo(() => toYmd(weekDays[6]), [weekDays]);

  const [schedules, setSchedules] = useState([]);
  const [staffSelf, setStaffSelf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workScheduleApi.myWorkSchedule({ from: weekFrom, to: weekTo });
      setSchedules(res.data?.data || []);
      setStaffSelf(res.data?.staff || null);
    } catch (err) {
      toast({
        title: 'Lỗi tải lịch',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [weekFrom, weekTo, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Pre-load staff list to support swap modal
  useEffect(() => {
    (async () => {
      try {
        const { default: axiosClient } = await import('@/api/axiosClient');
        const res = await axiosClient.get('/staff-lookup');
        setStaffList(Array.isArray(res.data) ? res.data : []);
      } catch {
        setStaffList([]);
      }
    })();
  }, []);

  const grouped = useMemo(
    () => groupSchedulesByStaffAndDate(schedules, weekDays),
    [schedules, weekDays]
  );
  const myRow = grouped[0];
  const selected = useMemo(
    () => schedules.find((s) => s.id === selectedId),
    [schedules, selectedId]
  );

  const goWeek = (offset) => {
    const next = new Date(anchor);
    next.setDate(next.getDate() + offset * 7);
    setAnchor(startOfIsoWeek(next));
  };

  if (!loading && !staffSelf) {
    return (
      <div className="p-6 text-center text-gray-500">
        Tài khoản của bạn chưa được liên kết với hồ sơ nhân sự.
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Lịch làm việc của tôi</h1>
          <p className="text-xs text-gray-500">
            {fmtVnDate(weekFrom)} - {fmtVnDate(weekTo)} · Tuần {computeIsoWeekNumber(weekDays[0])}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => goWeek(-1)} className="p-1.5 border rounded hover:bg-gray-100 bg-white">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setAnchor(startOfIsoWeek(new Date()))} className="px-3 py-1 border rounded hover:bg-gray-100 bg-white text-xs font-medium">
            Hôm nay
          </button>
          <button onClick={() => goWeek(1)} className="p-1.5 border rounded hover:bg-gray-100 bg-white">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-center text-xs text-gray-500 border-b">
              {weekDays.map((d) => (
                <th key={toYmd(d)} className="p-2 border-r font-medium">
                  {WEEKDAY_LABEL[d.getDay()]}<br />
                  <span className="font-normal">
                    {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              {weekDays.map((d) => {
                const key = toYmd(d);
                const cells = myRow?.cells?.[key] || [];
                return (
                  <td key={key} className="p-1 border-r align-top min-w-[110px]">
                    {cells.length === 0 ? (
                      <div className="text-center text-gray-300 text-xs py-3">Nghỉ</div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {cells.map((s) => (
                          <ShiftBlock
                            key={s.id}
                            schedule={s}
                            isSelected={s.id === selectedId}
                            onClick={setSelectedId}
                          />
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="bg-white border rounded-lg shadow-sm p-4 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-800 text-sm">Chi tiết ca</h2>
            <span className={`px-2 py-0.5 rounded border ${SCHEDULE_STATUS_BADGE[selected.status] || ''}`}>
              {SCHEDULE_STATUS_LABEL[selected.status] || selected.status}
            </span>
          </div>
          <div><strong>Ngày:</strong> {fmtVnDate(selected.work_date)}</div>
          <div><strong>Giờ:</strong> {trimTime(selected.start_time)} - {trimTime(selected.end_time)}</div>
          <div><strong>Chi nhánh:</strong> {selected.branch?.name || '—'} {selected.room ? `· ${selected.room}` : ''}</div>
          <div><strong>Vai trò:</strong> {selected.work_role}</div>
          {selected.notes && <div><strong>Ghi chú:</strong> {selected.notes}</div>}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setLeaveOpen(true)}
              className="px-3 py-1.5 border rounded text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100"
            >
              Yêu cầu nghỉ phép
            </button>
            <button
              onClick={() => setSwapOpen(true)}
              className="px-3 py-1.5 border rounded text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"
            >
              Yêu cầu đổi ca
            </button>
          </div>
        </div>
      )}

      <LeaveRequestModal
        open={leaveOpen}
        schedule={selected}
        onClose={() => setLeaveOpen(false)}
        onSuccess={load}
        toast={toast}
      />
      <SwapRequestModal
        open={swapOpen}
        schedule={selected}
        staffList={staffList}
        onClose={() => setSwapOpen(false)}
        onSuccess={load}
        toast={toast}
      />
    </div>
  );
};

export default MyWorkSchedule;
