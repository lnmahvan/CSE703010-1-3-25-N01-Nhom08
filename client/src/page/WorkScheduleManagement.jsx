import React, { useState } from 'react';
import { Copy, Plus, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import useWorkSchedule from '@/features/work-schedule/hooks/useWorkSchedule';
import ScheduleFilterBar from '@/features/work-schedule/components/ScheduleFilterBar';
import ScheduleWeekGrid from '@/features/work-schedule/components/ScheduleWeekGrid';
import ScheduleDetailPanel from '@/features/work-schedule/components/ScheduleDetailPanel';
import PendingRequestsPanel from '@/features/work-schedule/components/PendingRequestsPanel';
import BranchStatsCard from '@/features/work-schedule/components/BranchStatsCard';
import StandardShiftsCard from '@/features/work-schedule/components/StandardShiftsCard';
import AuditLogCard from '@/features/work-schedule/components/AuditLogCard';
import ScheduleFormModal from '@/features/work-schedule/components/ScheduleFormModal';
import CopyWeekModal from '@/features/work-schedule/components/CopyWeekModal';
import CancelScheduleModal from '@/features/work-schedule/components/CancelScheduleModal';
import LeaveRequestModal from '@/features/work-schedule/components/LeaveRequestModal';
import SwapRequestModal from '@/features/work-schedule/components/SwapRequestModal';
import { fmtVnDate } from '@/features/work-schedule/utils';

const WorkScheduleManagement = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = userRole === 'admin';

  const ws = useWorkSchedule();

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [formEditing, setFormEditing] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState(null);

  const openCreate = () => {
    setFormEditing(false);
    setFormInitial(null);
    setFormOpen(true);
  };

  const openEdit = (schedule) => {
    setFormEditing(true);
    setFormInitial(schedule);
    setFormOpen(true);
  };

  const submitForm = async (payload) => {
    if (formEditing && formInitial) {
      return ws.updateSchedule(formInitial.id, payload);
    }
    return ws.createSchedule(payload);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Quản lý lịch làm việc</h1>
          <p className="text-xs text-gray-500">
            Hiển thị tuần {fmtVnDate(ws.weekFrom)} - {fmtVnDate(ws.weekTo)}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setCopyOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 border bg-white rounded text-xs font-medium hover:bg-gray-50"
            >
              <Copy size={12} /> Sao chép lịch
            </button>
            <button
              disabled
              className="flex items-center gap-1 px-3 py-1.5 border bg-white rounded text-xs font-medium text-gray-400"
              title="Sẽ bổ sung trong phiên bản tiếp theo"
            >
              <Download size={12} /> Xuất Excel
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium shadow hover:bg-blue-700"
            >
              <Plus size={12} /> Tạo lịch làm việc
            </button>
          </div>
        )}
      </div>

      <ScheduleFilterBar
        filters={ws.filters}
        branches={ws.branches}
        staffList={ws.staffList}
        onChange={ws.setFilters}
      />

      <div className="flex flex-col xl:flex-row gap-4">
        <ScheduleWeekGrid
          weekDays={ws.weekDays}
          schedules={ws.schedules}
          selectedScheduleId={ws.selectedScheduleId}
          onSelectSchedule={ws.setSelectedScheduleId}
          onPrev={() => ws.goToWeek(-1)}
          onToday={ws.goToday}
          onNext={() => ws.goToWeek(1)}
          loading={ws.loading}
        />

        <aside className="w-full xl:w-[360px] flex flex-col gap-4 flex-shrink-0">
          <ScheduleDetailPanel
            schedule={ws.selectedSchedule}
            isAdmin={isAdmin}
            onClose={() => ws.setSelectedScheduleId(null)}
            onEdit={openEdit}
            onCancel={(s) => { setCancelTarget(s); setCancelOpen(true); }}
            onLeaveRequest={(s) => { setLeaveTarget(s); setLeaveOpen(true); }}
            onSwapRequest={(s) => { setSwapTarget(s); setSwapOpen(true); }}
          />
          <PendingRequestsPanel
            leaveRequests={ws.leaveRequests}
            swapRequests={ws.swapRequests}
            isAdmin={isAdmin}
            onApproveLeave={ws.approveLeave}
            onRejectLeave={ws.rejectLeave}
            onApproveSwap={ws.approveSwap}
            onRejectSwap={ws.rejectSwap}
          />
        </aside>
      </div>

      <BranchStatsCard
        stats={ws.branchStats}
        fromLabel={fmtVnDate(ws.weekFrom)}
        toLabel={fmtVnDate(ws.weekTo)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StandardShiftsCard templates={ws.templates} />
        <AuditLogCard logs={ws.auditLogs} />
      </div>

      <ScheduleFormModal
        open={formOpen}
        isEditing={formEditing}
        initialData={formInitial}
        staffList={ws.staffList}
        branches={ws.branches}
        templates={ws.templates}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <CopyWeekModal
        open={copyOpen}
        defaultSourceDate={ws.weekDays[0]}
        onClose={() => setCopyOpen(false)}
        onConfirm={ws.copyWeek}
      />

      <CancelScheduleModal
        open={cancelOpen}
        schedule={cancelTarget}
        onClose={() => setCancelOpen(false)}
        onConfirm={ws.cancelSchedule}
      />

      <LeaveRequestModal
        open={leaveOpen}
        schedule={leaveTarget}
        onClose={() => setLeaveOpen(false)}
        onSuccess={ws.refreshAll}
        toast={toast}
      />

      <SwapRequestModal
        open={swapOpen}
        schedule={swapTarget}
        staffList={ws.staffList}
        onClose={() => setSwapOpen(false)}
        onSuccess={ws.refreshAll}
        toast={toast}
      />
    </div>
  );
};

export default WorkScheduleManagement;
