import React from 'react';
import { Users } from 'lucide-react';
import { useStaffManagement } from '@/features/staff-management/hooks/useStaffManagement';
import StaffTable from '@/features/staff-management/components/StaffTable';
import StaffFormModal from '@/features/staff-management/components/StaffFormModal';

export default function StaffManagement() {
  const {
    staffList,
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
    setSearchTerm,
    setFilterRoleId,
    setFilterStatus,
    setFormData,
    openCreateModal,
    openEditModal,
    closeFormModal,
    loadHistory,
    loadStaff,
    handleToggleStatus,
    handleSubmit
  } = useStaffManagement();

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 animate-in fade-in overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm border border-teal-100">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Quản lý hồ sơ nhân sự</h3>
            <p className="text-sm text-slate-500">Quản lý thông tin, vai trò và trạng thái công việc của nhân viên</p>
          </div>
        </div>
      </div>

      <StaffTable
        staffList={staffList}
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
        onToggleStatus={handleToggleStatus}
        onPageChange={loadStaff}
      />

      <StaffFormModal
        open={showModal}
        isEditing={isEditing}
        formData={formData}
        availableRoles={availableRoles}
        onClose={closeFormModal}
        onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
