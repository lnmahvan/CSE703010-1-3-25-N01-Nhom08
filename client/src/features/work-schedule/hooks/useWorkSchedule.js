import { useCallback, useEffect, useMemo, useState } from 'react';
import workScheduleApi from '@/api/workScheduleApi';
import axiosClient from '@/api/axiosClient';
import { staffApi } from '@/api/staffApi';
import { useToast } from '@/hooks/use-toast';
import { buildWeekDays, startOfIsoWeek, toYmd } from '../utils';

const initialFilters = {
  branch_id: 'all',
  role: 'all',
  staff_id: 'all',
  status: 'all',
  search: '',
};

const useWorkSchedule = () => {
  const { toast } = useToast();

  const [anchorDate, setAnchorDate] = useState(() => startOfIsoWeek(new Date()));
  const weekDays = useMemo(() => buildWeekDays(anchorDate), [anchorDate]);
  const weekFrom = useMemo(() => toYmd(weekDays[0]), [weekDays]);
  const weekTo = useMemo(() => toYmd(weekDays[6]), [weekDays]);

  const [filters, setFilters] = useState(initialFilters);
  const [schedules, setSchedules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [branchStats, setBranchStats] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  const loadCore = useCallback(async () => {
    try {
      const [tpls, branchRes, staffRes] = await Promise.all([
        workScheduleApi.templates(),
        axiosClient.get('/branches'),
        staffApi.getAll({ per_page: 200 }),
      ]);
      setTemplates(tpls.data || []);
      const branchData = Array.isArray(branchRes.data)
        ? branchRes.data
        : branchRes.data.branches || [];
      setBranches(branchData);
      const staffData = Array.isArray(staffRes.data)
        ? staffRes.data
        : staffRes.data.data || staffRes.data.staff || [];
      setStaffList(staffData);
    } catch (err) {
      toast({
        title: 'Lỗi tải dữ liệu',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        from: weekFrom,
        to: weekTo,
        branch_id: filters.branch_id,
        role: filters.role,
        staff_id: filters.staff_id,
        status: filters.status,
        search: filters.search || undefined,
      };
      const res = await workScheduleApi.list(params);
      setSchedules(res.data?.data || []);
    } catch (err) {
      toast({
        title: 'Lỗi tải lịch',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, weekFrom, weekTo, toast]);

  const loadRequests = useCallback(async () => {
    try {
      const [leaves, swaps] = await Promise.all([
        workScheduleApi.listLeaveRequests({ status: 'pending', limit: 20 }),
        workScheduleApi.listSwapRequests({ status: 'pending', limit: 20 }),
      ]);
      setLeaveRequests(leaves.data || []);
      setSwapRequests(swaps.data || []);
    } catch {
      // Non-critical: silent
    }
  }, []);

  const loadBranchStats = useCallback(async () => {
    try {
      const res = await workScheduleApi.branchStats({ from: weekFrom, to: weekTo });
      setBranchStats(res.data || []);
    } catch {
      // Non-critical: silent
    }
  }, [weekFrom, weekTo]);

  const loadAuditLogs = useCallback(async () => {
    try {
      const res = await workScheduleApi.auditLogs({ limit: 30 });
      setAuditLogs(res.data || []);
    } catch {
      // Non-critical: silent
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRequests();
    loadBranchStats();
    loadAuditLogs();
  }, [loadRequests, loadBranchStats, loadAuditLogs]);

  const goToWeek = (offset) => {
    const next = new Date(anchorDate);
    next.setDate(next.getDate() + offset * 7);
    setAnchorDate(startOfIsoWeek(next));
  };
  const goToday = () => setAnchorDate(startOfIsoWeek(new Date()));

  const refreshAll = useCallback(() => {
    loadSchedules();
    loadRequests();
    loadBranchStats();
    loadAuditLogs();
  }, [loadSchedules, loadRequests, loadBranchStats, loadAuditLogs]);

  const handleApiError = (err, fallback) => {
    const data = err.response?.data;
    const errors = data?.errors;
    let description = data?.message || err.message || fallback;
    if (errors && typeof errors === 'object') {
      description = Object.values(errors).flat().join(' \u2022 ');
    }
    toast({ title: fallback, description, variant: 'destructive' });
  };

  const createSchedule = async (data) => {
    try {
      await workScheduleApi.create(data);
      toast({ title: 'Đã tạo lịch làm việc' });
      refreshAll();
      return true;
    } catch (err) {
      handleApiError(err, 'Không thể tạo lịch');
      return false;
    }
  };

  const updateSchedule = async (id, data) => {
    try {
      await workScheduleApi.update(id, data);
      toast({ title: 'Đã cập nhật lịch' });
      refreshAll();
      return true;
    } catch (err) {
      handleApiError(err, 'Không thể cập nhật lịch');
      return false;
    }
  };

  const cancelSchedule = async (id, reason) => {
    try {
      await workScheduleApi.cancel(id, reason);
      toast({ title: 'Đã hủy lịch' });
      setSelectedScheduleId(null);
      refreshAll();
      return true;
    } catch (err) {
      handleApiError(err, 'Không thể hủy lịch');
      return false;
    }
  };

  const copyWeek = async (sourceFrom, destFrom) => {
    try {
      const res = await workScheduleApi.copyWeek({
        source_from: sourceFrom,
        dest_from: destFrom,
        skip_conflicts: true,
      });
      toast({
        title: 'Sao chép lịch hoàn tất',
        description: `Đã tạo ${res.data.created} lịch, bỏ qua ${res.data.skipped} lịch xung đột`,
      });
      refreshAll();
      return true;
    } catch (err) {
      handleApiError(err, 'Sao chép thất bại');
      return false;
    }
  };

  const approveLeave = async (id, note) => {
    try {
      await workScheduleApi.approveLeaveRequest(id, note || null);
      toast({ title: 'Đã duyệt yêu cầu nghỉ phép' });
      refreshAll();
      return true;
    } catch (err) {
      handleApiError(err, 'Không thể duyệt yêu cầu');
      return false;
    }
  };

  const rejectLeave = async (id, note) => {
    try {
      await workScheduleApi.rejectLeaveRequest(id, note);
      toast({ title: 'Đã từ chối yêu cầu nghỉ phép' });
      refreshAll();
      return true;
    } catch (err) {
      handleApiError(err, 'Không thể từ chối yêu cầu');
      return false;
    }
  };

  const approveSwap = async (id, note) => {
    try {
      await workScheduleApi.approveSwapRequest(id, note || null);
      toast({ title: 'Đã duyệt đổi ca' });
      refreshAll();
      return true;
    } catch (err) {
      handleApiError(err, 'Không thể duyệt đổi ca');
      return false;
    }
  };

  const rejectSwap = async (id, note) => {
    try {
      await workScheduleApi.rejectSwapRequest(id, note);
      toast({ title: 'Đã từ chối đổi ca' });
      refreshAll();
      return true;
    } catch (err) {
      handleApiError(err, 'Không thể từ chối đổi ca');
      return false;
    }
  };

  const selectedSchedule = useMemo(
    () => schedules.find((s) => s.id === selectedScheduleId) || null,
    [schedules, selectedScheduleId]
  );

  return {
    anchorDate,
    weekDays,
    weekFrom,
    weekTo,
    filters,
    setFilters,
    schedules,
    templates,
    staffList,
    branches,
    leaveRequests,
    swapRequests,
    branchStats,
    auditLogs,
    loading,
    selectedScheduleId,
    selectedSchedule,
    setSelectedScheduleId,
    goToWeek,
    goToday,
    refreshAll,
    createSchedule,
    updateSchedule,
    cancelSchedule,
    copyWeek,
    approveLeave,
    rejectLeave,
    approveSwap,
    rejectSwap,
  };
};

export default useWorkSchedule;
