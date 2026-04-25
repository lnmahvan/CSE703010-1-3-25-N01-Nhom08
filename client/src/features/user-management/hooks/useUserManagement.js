import { useEffect, useRef, useState } from 'react';
import { userManagementService } from '@/features/user-management/services/userManagementService';

const emptyFormData = {
  id: null,
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  role_id: '',
  status: 'active',
  linked_profile_id: '',
};

const emptyResetForm = {
  otp: '',
  newPassword: '',
};

export function useUserManagement() {
  const hasInitializedSearch = useRef(false);
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoleId, setFilterRoleId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [resetModal, setResetModal] = useState({ show: false, user: null, step: 1 });
  const [resetForm, setResetForm] = useState(emptyResetForm);

  const fetchUsers = async ({
    page = 1,
    search = searchTerm,
    roleId = filterRoleId,
    status = filterStatus,
    showLoading = true,
  } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await userManagementService.fetchUsers({
        page,
        search,
        role_id: roleId,
        status,
      });

      setUsers(data.data);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
    } catch (error) {
      console.error('Loi lay danh sach:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadUsers = async (page = 1) => {
    await fetchUsers({ page });
  };

  const loadHistory = async () => {
    try {
      const data = await userManagementService.fetchHistory();
      setHistoryLogs(data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Loi lay lich su:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setLoading(true);

      try {
        const [roles, usersResponse] = await Promise.all([
          userManagementService.fetchRoles(),
          userManagementService.fetchUsers({
            page: 1,
            search: '',
            role_id: '',
            status: '',
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setAvailableRoles(roles);
        setUsers(usersResponse.data);
        setCurrentPage(usersResponse.current_page);
        setTotalPages(usersResponse.last_page);
      } catch (error) {
        if (isMounted) {
          console.error('Loi khoi tao du lieu quan ly tai khoan:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasInitializedSearch.current) {
      hasInitializedSearch.current = true;
      return;
    }

    let isMounted = true;

    const delaySearch = setTimeout(() => {
      const loadSearchedUsers = async () => {
        setLoading(true);

        try {
          const data = await userManagementService.fetchUsers({
            page: 1,
            search: searchTerm,
            role_id: filterRoleId,
            status: filterStatus,
          });

          if (!isMounted) {
            return;
          }

          setUsers(data.data);
          setCurrentPage(data.current_page);
          setTotalPages(data.last_page);
        } catch (error) {
          if (isMounted) {
            console.error('Loi cap nhat bo loc danh sach:', error);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      loadSearchedUsers();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(delaySearch);
    };
  }, [filterRoleId, filterStatus, searchTerm]);

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({
      ...user,
      password: '',
      role_id: user.roles?.[0]?.id ?? '',
    });
    setShowModal(true);
  };

  const closeFormModal = () => {
    setShowModal(false);
  };

  const openResetModal = (user) => {
    setResetModal({ show: true, user, step: 1 });
    setResetForm(emptyResetForm);
  };

  const closeResetModal = () => {
    setResetModal({ show: false, user: null, step: 1 });
    setResetForm(emptyResetForm);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
  };

  const handleToggleStatus = async (user) => {
    if (!window.confirm(`Xac nhan ${user.status === 'active' ? 'khoa' : 'mo khoa'} tai khoan ${user.username}?`)) {
      return;
    }

    try {
      const data = await userManagementService.toggleUserStatus(user.id);
      alert(data.message);
      loadUsers(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || 'Co loi xay ra!');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.role_id) {
      alert('Vui long chon vai tro!');
      return;
    }

    try {
      if (isEditing) {
        await userManagementService.updateUser(formData.id, formData);
        alert('Cap nhat thanh cong!');
      } else {
        await userManagementService.createUser(formData);
        alert('Tao tai khoan moi thanh cong!');
      }

      setShowModal(false);
      await loadUsers(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || 'Loi khi luu du lieu!');
    }
  };

  const handleSendOtp = async () => {
    try {
      const data = await userManagementService.sendResetOtp(resetModal.user.id);
      alert(data.message);
      setResetModal((current) => ({ ...current, step: 2 }));
    } catch (error) {
      alert(error.response?.data?.message || 'Loi khi gui OTP!');
    }
  };

  const handleAdvanceResetStep = () => {
    if (resetForm.otp.length !== 6) {
      alert('Nhap du 6 so!');
      return;
    }

    setResetModal((current) => ({ ...current, step: 3 }));
  };

  const handleBackResetStep = () => {
    setResetModal((current) => ({ ...current, step: 2 }));
  };

  const handleVerifyAndReset = async (event) => {
    event.preventDefault();

    try {
      const data = await userManagementService.verifyAndResetPassword(
        resetModal.user.id,
        resetForm.otp,
        resetForm.newPassword
      );

      alert(data.message);
      closeResetModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Ma OTP khong dung hoac co loi!');
    }
  };

  return {
    users,
    availableRoles,
    loading,
    currentPage,
    totalPages,
    searchTerm,
    filterRoleId,
    filterStatus,
    showModal,
    isEditing,
    formData,
    showHistoryModal,
    historyLogs,
    resetModal,
    resetForm,
    setSearchTerm,
    setFilterRoleId,
    setFilterStatus,
    setFormData,
    setResetForm,
    openCreateModal,
    openEditModal,
    closeFormModal,
    openResetModal,
    closeResetModal,
    closeHistoryModal,
    loadUsers,
    loadHistory,
    handleToggleStatus,
    handleSubmit,
    handleSendOtp,
    handleAdvanceResetStep,
    handleBackResetStep,
    handleVerifyAndReset,
  };
}
