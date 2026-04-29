import { useState, useEffect, useCallback } from 'react';
import { staffApi } from '@/api/staffApi';
import { useToast } from '@/hooks/use-toast';
import { getAllRoles } from '@/api/userApi';

const EMPTY_FORM = {
  employee_code: '',
  full_name: '',
  birthday: '',
  gender: '',
  id_card: '',
  id_card_verified: false,
  nationality: 'Việt Nam',
  email: '',
  phone: '',
  role_slug: '',
  join_date: '',
  status: 'working',
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const useStaffManagement = () => {
  const { toast } = useToast();

  // Data States
  const [staffList, setStaffList] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoleId, setFilterRoleId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [joinDateFrom, setJoinDateFrom] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);

  const loadRoles = useCallback(async () => {
    try {
      const res = await getAllRoles();
      const staffRoles = res.data.filter((r) => r.slug !== 'benh_nhan');
      setAvailableRoles(staffRoles);
    } catch (err) {
      console.error('Lỗi khi tải vai trò:', err);
    }
  }, []);

  const loadStaff = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: perPage,
          search: searchTerm,
        };
        if (filterRoleId !== 'all') params.role = filterRoleId;
        if (filterStatus !== 'all') params.status = filterStatus;
        if (joinDateFrom) params.join_date_from = joinDateFrom;

        const response = await staffApi.getAll(params);
        setStaffList(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
        setTotalItems(response.data.total ?? response.data.data.length);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải danh sách nhân sự.',
        });
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filterRoleId, filterStatus, joinDateFrom, perPage, toast]
  );

  useEffect(() => {
    (async () => {
      await loadRoles();
    })();
  }, [loadRoles]);

  useEffect(() => {
    (async () => {
      await loadStaff(1);
    })();
  }, [loadStaff]);

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEditModal = (staff) => {
    setIsEditing(true);
    setFormData({
      id: staff.id,
      employee_code: staff.employee_code || '',
      full_name: staff.full_name || '',
      birthday: staff.birthday ? staff.birthday.split('T')[0] : '',
      gender: staff.gender || '',
      id_card: staff.id_card || '',
      id_card_verified: !!staff.id_card_verified,
      nationality: staff.nationality || 'Việt Nam',
      email: staff.email || '',
      phone: staff.phone || '',
      role_slug: staff.role_slug || '',
      join_date: staff.join_date ? staff.join_date.split('T')[0] : '',
      status: staff.status || 'working',
    });
    setShowModal(true);
  };

  const closeFormModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email || !formData.role_slug) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng nhập đầy đủ thông tin bắt buộc (*).',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Email không đúng định dạng.',
      });
      return;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Số điện thoại phải gồm đúng 10 chữ số.',
      });
      return;
    }

    try {
      if (isEditing) {
        await staffApi.update(formData.id, formData);
        toast({ title: 'Thành công', description: 'Cập nhật hồ sơ thành công' });
      } else {
        await staffApi.create(formData);
        toast({ title: 'Thành công', description: 'Thêm nhân sự mới thành công' });
      }
      closeFormModal();
      loadStaff(currentPage);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.response?.data?.message || 'Lưu thất bại',
      });
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    // BUG-8 FIX: Không cho toggle từ resigned về working
    if (currentStatus === 'resigned') {
      toast({
        variant: 'destructive',
        title: 'Không thể chuyển trạng thái',
        description: 'Nhân sự đã nghỉ việc. Vui lòng liên hệ quản trị viên để tái tuyển dụng.',
      });
      return;
    }
    const newStatus = currentStatus === 'working' ? 'suspended' : 'working';
    try {
      await staffApi.changeStatus(id, newStatus);
      toast({
        title: 'Thành công',
        description: `Đã chuyển trạng thái thành: ${newStatus === 'working' ? 'Đang làm việc' : 'Tạm nghỉ'}`,
      });
      loadStaff(currentPage);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Chuyển trạng thái thất bại',
      });
    }
  };

  const handleResetPassword = async (id) => {
    try {
      const res = await staffApi.resetPassword(id);
      const tempPwd = res.data?.temporary_password;
      const username = res.data?.username;
      toast({
        title: 'Đã đặt lại mật khẩu',
        description: tempPwd
          ? `Mật khẩu tạm thời cho ${username || 'tài khoản'}: ${tempPwd}`
          : 'Yêu cầu đặt lại mật khẩu thành công.',
      });
      return res.data;
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Đặt lại mật khẩu thất bại',
      });
      return null;
    }
  };

  const loadHistory = async (staffId) => {
    try {
      const response = await staffApi.getHistory(staffId);
      setHistoryLogs(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Lỗi tải lịch sử' });
      return [];
    }
  };

  const openHistoryModal = () => setShowHistoryModal(true);
  const closeHistoryModal = () => setShowHistoryModal(false);

  return {
    staffList,
    availableRoles,
    loading,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    searchTerm,
    filterRoleId,
    filterStatus,
    joinDateFrom,
    showModal,
    isEditing,
    formData,
    showHistoryModal,
    historyLogs,
    setSearchTerm,
    setFilterRoleId,
    setFilterStatus,
    setJoinDateFrom,
    setPerPage,
    setFormData,
    openCreateModal,
    openEditModal,
    closeFormModal,
    loadHistory,
    openHistoryModal,
    closeHistoryModal,
    loadStaff,
    handleToggleStatus,
    handleResetPassword,
    handleSubmit,
  };
};
