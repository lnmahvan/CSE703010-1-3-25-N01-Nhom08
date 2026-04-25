import React from 'react';
import UserFormModal from '@/features/user-management/components/UserFormModal';
import UserHistoryModal from '@/features/user-management/components/UserHistoryModal';
import UserManagementTable from '@/features/user-management/components/UserManagementTable';
import UserResetPasswordModal from '@/features/user-management/components/UserResetPasswordModal';
import { useUserManagement } from '@/features/user-management/hooks/useUserManagement';

const UserManagement = () => {
  const {
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
  } = useUserManagement();

  return (
    <div className="animate-in fade-in duration-500 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
      <UserManagementTable
        users={users}
        availableRoles={availableRoles}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        searchTerm={searchTerm}
        filterRoleId={filterRoleId}
        filterStatus={filterStatus}
        onSearchChange={setSearchTerm}
        onRoleFilterChange={setFilterRoleId}
        onStatusFilterChange={setFilterStatus}
        onOpenHistory={loadHistory}
        onOpenCreate={openCreateModal}
        onEdit={openEditModal}
        onResetPassword={openResetModal}
        onToggleStatus={handleToggleStatus}
        onPageChange={loadUsers}
      />

      <UserFormModal
        open={showModal}
        isEditing={isEditing}
        formData={formData}
        availableRoles={availableRoles}
        onClose={closeFormModal}
        onChange={(field, value) => setFormData((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
      />

      <UserResetPasswordModal
        resetModal={resetModal}
        resetForm={resetForm}
        onClose={closeResetModal}
        onChange={(field, value) => setResetForm((current) => ({ ...current, [field]: value }))}
        onSendOtp={handleSendOtp}
        onContinue={handleAdvanceResetStep}
        onBack={handleBackResetStep}
        onSubmit={handleVerifyAndReset}
      />

      <UserHistoryModal
        open={showHistoryModal}
        historyLogs={historyLogs}
        onClose={closeHistoryModal}
      />
    </div>
  );
};

export default UserManagement;
