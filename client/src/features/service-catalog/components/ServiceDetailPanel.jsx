import React, { useEffect, useState } from 'react';
import { serviceCatalogApi } from '@/api/serviceCatalogApi';
import AttachmentManager from './AttachmentManager';
import StatusChangeModal from './StatusChangeModal';
import { DETAIL_TABS, STATUS_BADGE_CLASS } from '../constants';
import {
  formatDate,
  formatDateTime,
  formatVnd,
  statusLabel,
  visibilityLabel,
} from '../utils';

const ServiceDetailPanel = ({
  serviceId,
  onClose,
  onEdit,
  canManage,
  onStatusChanged,
}) => {
  const [tab, setTab] = useState('general');
  const [service, setService] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    if (!serviceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setService(null);
      setAttachments([]);
      return;
    }
    setLoading(true);
    Promise.all([
      serviceCatalogApi.get(serviceId),
      serviceCatalogApi.attachments(serviceId),
    ])
      .then(([s, a]) => {
        setService(s.data);
        setAttachments(a.data || []);
      })
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (!serviceId) {
    return (
      <div className="w-full lg:w-[360px] bg-white border rounded-lg shadow-sm flex items-center justify-center text-xs text-gray-400 h-48">
        Chọn một dịch vụ để xem chi tiết
      </div>
    );
  }

  const reloadAttachments = async () => {
    const res = await serviceCatalogApi.attachments(serviceId);
    setAttachments(res.data || []);
  };

  const upload = async (file, meta) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('attachment_type', meta.attachment_type);
      fd.append('visibility', meta.visibility);
      if (meta.description) fd.append('description', meta.description);
      await serviceCatalogApi.uploadAttachment(serviceId, fd);
      await reloadAttachments();
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (id) => {
    if (!confirm('Xoá tệp này?')) return;
    await serviceCatalogApi.deleteAttachment(serviceId, id);
    await reloadAttachments();
  };

  const handleStatusChange = async (status, reason) => {
    await serviceCatalogApi.changeStatus(serviceId, { status, reason });
    const s = await serviceCatalogApi.get(serviceId);
    setService(s.data);
    setStatusOpen(false);
    if (onStatusChanged) onStatusChanged();
  };

  const primary = service?.specialties?.find((s) => s.pivot?.is_primary);

  return (
    <div className="w-full lg:w-[360px] bg-white border rounded-lg shadow-sm flex flex-col flex-shrink-0">
      <div className="px-4 py-3 flex justify-between items-center border-b">
        <h2 className="font-semibold text-gray-800 text-sm">Chi tiết dịch vụ</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      {loading || !service ? (
        <div className="p-4 text-xs text-gray-500">Đang tải...</div>
      ) : (
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          <div className="flex gap-3 items-start">
            <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center text-2xl text-gray-300 flex-shrink-0">
              🦷
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="text-[11px] text-gray-500">{service.service_code}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] border ${
                    STATUS_BADGE_CLASS[service.status] || ''
                  }`}
                >
                  {statusLabel(service.status)}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1.5">
                {service.name}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {service.group?.name && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border">
                    {service.group.name}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border">
                  {visibilityLabel(service.visibility)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-y py-3 text-center">
            <div>
              <div className="text-[10px] text-gray-500">Giá hiện tại</div>
              <div className="font-medium text-gray-900">{formatVnd(service.price)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">Thời lượng</div>
              <div className="font-medium text-gray-900">
                {service.duration_minutes ? `${service.duration_minutes} phút` : '-'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">Chuyên môn chính</div>
              <div className="font-medium text-gray-900">{primary?.name || '-'}</div>
            </div>
          </div>

          <div className="flex border-b text-[12px] overflow-x-auto">
            {DETAIL_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-2 py-2 whitespace-nowrap ${
                  tab === t.id
                    ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'general' && (
            <div className="space-y-2">
              <Row label="Mã dịch vụ" value={service.service_code} />
              <Row label="Nhóm dịch vụ" value={service.group?.name} />
              <Row label="Mô tả" value={service.description || '-'} />
              <Row label="Hoa hồng" value={`${service.commission_rate || 0}%`} />
              <Row label="Ghi chú" value={service.notes || '-'} />
              <Row label="Người tạo" value={service.creator?.name || '-'} />
              <Row label="Cập nhật lần cuối" value={formatDateTime(service.updated_at)} />
            </div>
          )}

          {tab === 'pricing' && (
            <div className="space-y-2">
              <div className="font-medium">Lịch sử giá</div>
              {(service.price_history || []).length === 0 ? (
                <div className="text-gray-400">Chưa có lịch sử giá.</div>
              ) : (
                <ul className="space-y-1">
                  {service.price_history.map((p) => (
                    <li key={p.id} className="border rounded p-2">
                      <div className="flex justify-between">
                        <span>
                          {formatVnd(p.old_price || 0)} → <strong>{formatVnd(p.new_price)}</strong>
                        </span>
                        <span className="text-gray-500">{formatDate(p.effective_date)}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {p.reason || ''} {p.changer?.name ? `· ${p.changer.name}` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'specialty' && (
            <div className="space-y-2">
              {(service.specialties || []).length === 0 ? (
                <div className="text-gray-400">Chưa có chuyên môn.</div>
              ) : (
                <ul className="space-y-1">
                  {service.specialties.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between border rounded p-2"
                    >
                      <span>{s.name}</span>
                      {s.pivot?.is_primary && (
                        <span className="text-amber-600 text-[10px]">★ Chính</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'attachments' && (
            <AttachmentManager
              attachments={attachments}
              onUpload={upload}
              onDelete={removeAttachment}
              uploading={uploading}
              canManage={canManage}
            />
          )}

          {tab === 'history' && (
            <div className="space-y-2">
              <div className="font-medium">Lịch sử trạng thái</div>
              {(service.status_history || []).length === 0 ? (
                <div className="text-gray-400">Chưa có lịch sử.</div>
              ) : (
                <ul className="space-y-1">
                  {service.status_history.map((h) => (
                    <li key={h.id} className="border rounded p-2">
                      <div className="flex justify-between">
                        <span>
                          {h.old_status ? statusLabel(h.old_status) : '—'} →{' '}
                          <strong>{statusLabel(h.new_status)}</strong>
                        </span>
                        <span className="text-gray-500">{formatDateTime(h.created_at)}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {h.reason || ''} {h.changer?.name ? `· ${h.changer.name}` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {canManage && service && (
        <div className="border-t p-3 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="px-3 py-1.5 border rounded bg-white hover:bg-gray-50"
          >
            ✎ Chỉnh sửa
          </button>
          <button
            type="button"
            onClick={() => setStatusOpen(true)}
            className="px-3 py-1.5 border rounded bg-white hover:bg-gray-50"
          >
            ⇄ Đổi trạng thái
          </button>
        </div>
      )}

      <StatusChangeModal
        open={statusOpen}
        currentStatus={service?.status}
        onClose={() => setStatusOpen(false)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="grid grid-cols-[110px_1fr] gap-2">
    <div className="text-gray-500">{label}</div>
    <div className="text-gray-900 break-words">{value ?? '-'}</div>
  </div>
);

export default ServiceDetailPanel;
