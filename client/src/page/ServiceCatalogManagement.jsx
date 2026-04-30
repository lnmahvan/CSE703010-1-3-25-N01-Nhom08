import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useServiceCatalog } from '@/features/service-catalog/hooks/useServiceCatalog';
import ServiceFilterBar from '@/features/service-catalog/components/ServiceFilterBar';
import ServiceTable from '@/features/service-catalog/components/ServiceTable';
import Pagination from '@/features/service-catalog/components/Pagination';
import ServiceDetailPanel from '@/features/service-catalog/components/ServiceDetailPanel';
import ServiceFormModal from '@/features/service-catalog/components/ServiceFormModal';

const ServiceCatalogManagement = () => {
  const { userRole, hasPermission } = useAuth();
  const canManage =
    userRole === 'admin' || hasPermission('services.create') || hasPermission('services.edit');

  const {
    items,
    meta,
    loading,
    filters,
    setFilter,
    resetFilters,
    page,
    setPage,
    perPage,
    setPerPage,
    groups,
    specialties,
    refresh,
    create,
    update,
  } = useServiceCatalog();

  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreate = () => {
    setFormInitial(null);
    setFormError('');
    setFormOpen(true);
  };

  const handleEdit = (service) => {
    setFormInitial(service);
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    setFormError('');
    try {
      if (formInitial?.id) {
        await update(formInitial.id, payload);
      } else {
        const created = await create(payload);
        if (created?.id) setSelectedId(created.id);
      }
      setFormOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})
          .flat()
          .join(' · ') ||
        'Lưu dịch vụ thất bại';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Quản lý dịch vụ nha khoa</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Quản lý danh mục dịch vụ, giá, chuyên môn và phạm vi hiển thị
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium text-xs"
            >
              + Thêm dịch vụ
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 bg-white border rounded-lg shadow-sm flex flex-col min-w-0 w-full">
          <ServiceFilterBar
            filters={filters}
            groups={groups}
            specialties={specialties}
            onChange={setFilter}
            onReset={resetFilters}
          />
          <div className="px-4 py-2 border-b bg-gray-50/50 text-[11px] text-gray-500 font-medium">
            Tổng {meta.total} dịch vụ
          </div>
          <ServiceTable
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onEdit={handleEdit}
            loading={loading}
            page={meta.current_page}
            perPage={perPage}
          />
          <Pagination
            page={page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={perPage}
            onChangePage={setPage}
            onChangePerPage={setPerPage}
          />
        </div>

        <ServiceDetailPanel
          serviceId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={handleEdit}
          canManage={canManage}
          onStatusChanged={refresh}
        />
      </div>

      <ServiceFormModal
        open={formOpen}
        initial={formInitial}
        groups={groups}
        specialties={specialties}
        saving={saving}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ServiceCatalogManagement;
