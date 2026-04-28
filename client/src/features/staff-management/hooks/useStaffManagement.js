import { useState, useEffect, useCallback } from 'react';
import { staffApi } from '@/api/staffApi';
import { useToast } from '@/hooks/use-toast';
import { getAllRoles } from '@/api/userApi';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoleId, setFilterRoleId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    role_slug: '',
    join_date: '',
    status: 'working'
  });
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);

  const loadRoles = useCallback(async () => {
    try {
      const res = await getAllRoles();
      // Loại bỏ vai trò bệnh nhân (benh_nhan) khỏi danh sách quản lý nhân sự
      const staffRoles = res.data.filter(r => r.slug !== 'benh_nhan');
      setAvailableRoles(staffRoles);
    } catch (err) {
      console.error('Lỗi khi tải vai trò:', err);
    }
  }, []);

  const loadStaff = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: searchTerm,
      };
      if (filterRoleId !== 'all') params.role = filterRoleId;
      if (filterStatus !== 'all') params.status = filterStatus;

      const response = await staffApi.getAll(params);
      setStaffList(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
      setTotalItems(response.data.total ?? response.data.data.length);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách nhân sự.",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRoleId, filterStatus, toast]);

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
    setFormData({
      employee_code: '',
      full_name: '',
      email: '',
      phone: '',
      role_slug: '',
      join_date: '',
      status: 'working'
    });
    setShowModal(true);
  };

  const openEditModal = (staff) => {
    setIsEditing(true);
    setFormData({
      id: staff.id,
      employee_code: staff.employee_code || '',
      full_name: staff.full_name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role_slug: staff.role_slug || '',
      join_date: staff.join_date ? staff.join_date.split('T')[0] : '',
      status: staff.status || 'working'
    });
    setShowModal(true);
  };

  const closeFormModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.full_name || !formData.email || !formData.role_slug) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập đầy đủ thông tin bắt buộc (*)." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ variant: "destructive", title: "Lỗi", description: "Email không đúng định dạng." });
      return;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số điện thoại phải gồm đúng 10 chữ số." });
      return;
    }

    try {
      if (isEditing) {
        await staffApi.update(formData.id, formData);
        toast({ title: "Thành công", description: "Cập nhật hồ sơ thành công" });
      } else {
        await staffApi.create(formData);
        toast({ title: "Thành công", description: "Thêm nhân sự mới thành công" });
      }
      closeFormModal();
      loadStaff(currentPage);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.response?.data?.message || "Lưu thất bại",
      });
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    // Nếu đang working -> suspended
    // Nếu suspended/resigned -> working
    const newStatus = currentStatus === 'working' ? 'suspended' : 'working';
    try {
      await staffApi.changeStatus(id, newStatus);
      toast({ title: "Thành công", description: `Đã chuyển trạng thái thành: ${newStatus}` });
      loadStaff(currentPage);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Chuyển trạng thái thất bại" });
    }
  };

  const loadHistory = async (staffId) => {
    try {
      const response = await staffApi.getHistory(staffId);
      setHistoryLogs(response.data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Lỗi tải lịch sử" });
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
  };

  return {
    staffList,
    availableRoles,
    loading,
    currentPage,
    totalPages,
    totalItems,
    searchTerm,
    filterRoleId,
    filterStatus,
    showModal,
    isEditing,
    formData,
    showHistoryModal,
    historyLogs,
    setSearchTerm,
    setFilterRoleId,
    setFilterStatus,
    setFormData,
    openCreateModal,
    openEditModal,
    closeFormModal,
    loadHistory,
    closeHistoryModal,
    loadStaff,
    handleToggleStatus,
    handleSubmit
  };
};
