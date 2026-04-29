import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  X,
  CheckCircle2,
  CircleX,
  ShieldOff,
  FileClock,
  Download,
  History as HistoryIcon,
} from 'lucide-react';
import { PROFILE_STATUS_META } from '@/features/professional-profiles/utils';

const TABS = [
  { id: 'general', label: 'Thông tin chuyên môn' },
  { id: 'certificates', label: 'Chứng chỉ & Tài liệu' },
  { id: 'history', label: 'Lịch sử thay đổi' },
];

const initialOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="text-sm text-slate-800">{children || '—'}</div>
    </div>
  );
}

export default function ProfessionalProfileDetailPanel({
  profile,
  history = [],
  loadingHistory = false,
  onClose,
  onApprove,
  onReject,
  onSubmit,
  onInvalidate,
  onEdit,
}) {
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab('general');
  }, [profile?.id]);

  if (!profile) {
    return (
      <aside className="w-full lg:w-[360px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-shrink-0 self-start">
        <div className="px-4 py-3 flex justify-between items-center border-b border-slate-200">
          <h2 className="font-semibold text-slate-800 text-sm">Chi tiết hồ sơ</h2>
        </div>
        <div className="p-6 text-center text-sm text-slate-500">
          Chọn một hồ sơ ở bảng để xem chi tiết.
        </div>
      </aside>
    );
  }

  const statusMeta = PROFILE_STATUS_META[profile.status] || PROFILE_STATUS_META.draft;
  const isDoctor = profile.profile_role === 'bac_si';
  const specialty = (profile.specialties || [])[0] || null;
  const primaryCert =
    (profile.certificates || []).find((c) => c.is_primary) ||
    (profile.certificates || [])[0] ||
    null;
  const services =
    (Array.isArray(profile.service_scope) && profile.service_scope.length > 0
      ? profile.service_scope
      : specialty?.service_scope) || [];
  const branchText = profile.branch?.name || specialty?.branch_or_room || '—';
  const profileDegree = profile.degree || specialty?.degree;
  const profileYears =
    profile.years_experience !== null && profile.years_experience !== undefined
      ? profile.years_experience
      : specialty?.years_experience;

  const canApprove = ['pending', 'expired'].includes(profile.status);
  const canReject = profile.status === 'pending';
  const canSubmit = ['draft', 'rejected', 'expired'].includes(profile.status);
  const canInvalidate = ['approved', 'pending'].includes(profile.status);

  return (
    <aside className="w-full lg:w-[360px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-shrink-0 self-start">
      <div className="px-4 py-3 flex justify-between items-center border-b border-slate-200">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <ChevronLeft className="w-4 h-4 text-slate-400" />
          Chi tiết hồ sơ
        </h2>
        <button
          type="button"
          onClick={onClose}
          title="Đóng"
          className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center text-sm text-slate-600 overflow-hidden flex-shrink-0">
            {profile.staff?.avatar ? (
              <img
                src={profile.staff.avatar}
                alt={profile.staff.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              initialOf(profile.staff?.full_name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 truncate" title={profile.staff?.full_name}>
              {profile.staff?.full_name || 'Chưa gán nhân sự'}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">{isDoctor ? 'Bác sĩ' : 'Kế toán'}</p>
            <p className="text-slate-500 text-xs truncate" title={profile.staff?.email}>
              {profile.staff?.employee_code || '—'} · {profile.staff?.email || '—'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusMeta.className}`}
          >
            {statusMeta.label}
          </span>
          {profile.approved_at ? (
            <span className="text-[10px] text-slate-400 truncate" title={`Bởi ${profile.approver?.name || 'Admin'}`}>
              Duyệt {formatDate(profile.approved_at)} · {profile.approver?.name || 'Admin'}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">
              Cập nhật {formatDate(profile.updated_at)}
            </span>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200 px-2 text-xs overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
            {tab.id === 'certificates' && (profile.certificates?.length || 0) > 0 && (
              <span className="ml-1 text-slate-400">({profile.certificates.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[60vh]">
        {activeTab === 'general' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Field label="Chuyên khoa chính">
                  {specialty?.specialty_name || (isDoctor ? '—' : 'Nghiệp vụ chung')}
                </Field>
                <Field label="Học vị">{profileDegree}</Field>
                <Field label="Kinh nghiệm">
                  {profileYears ? `${profileYears} năm` : '—'}
                </Field>
              </div>
              <div className="space-y-3">
                <Field label="Chứng chỉ hành nghề">{primaryCert?.certificate_number}</Field>
                <Field label="Ngày cấp">{formatDate(primaryCert?.issued_date)}</Field>
                <Field label="Ngày hết hạn">{formatDate(primaryCert?.expiry_date)}</Field>
                <Field label="Ghi chú">{profile.notes}</Field>
              </div>
            </div>

            {isDoctor && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Dịch vụ được phép thực hiện</div>
                {services.length > 0 ? (
                  <ul className="list-disc pl-4 text-sm text-slate-800 space-y-0.5">
                    {services.map((svc, idx) => (
                      <li key={idx}>{svc}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-400">Chưa gán dịch vụ</div>
                )}
              </div>
            )}

            <Field label="Chi nhánh / Phòng">{branchText}</Field>

            {profile.rejection_reason && (
              <div className="text-sm">
                <div className="text-red-600 mb-1">Lý do từ chối</div>
                <div className="rounded border border-red-200 bg-red-50 p-2 text-red-700 text-xs">
                  {profile.rejection_reason}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'certificates' && (
          <>
            {(profile.certificates || []).length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-6">
                Chưa có chứng chỉ hoặc tài liệu nào.
              </div>
            ) : (
              <div className="space-y-2">
                {profile.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-slate-200 rounded p-2.5 bg-slate-50 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-slate-800 text-sm truncate">
                        {cert.certificate_name || cert.certificate_type}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {cert.is_primary && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Chính
                          </span>
                        )}
                        {cert.is_expired && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                            Hết hạn
                          </span>
                        )}
                        {cert.is_expiring_soon && !cert.is_expired && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Sắp hết
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {cert.certificate_type}
                      {cert.certificate_number ? ` · ${cert.certificate_number}` : ''}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Cấp: {formatDate(cert.issued_date)} · Hết hạn: {formatDate(cert.expiry_date)}
                    </div>
                    {cert.file_name && (
                      <div className="text-[11px] flex items-center gap-1 text-blue-600">
                        <Download className="w-3 h-3" />
                        <span className="truncate">{cert.file_name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {loadingHistory ? (
              <div className="text-sm text-slate-400 text-center py-6">Đang tải lịch sử...</div>
            ) : history.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
                <HistoryIcon className="w-6 h-6 text-slate-300" />
                Chưa có lịch sử thay đổi.
              </div>
            ) : (
              <ul className="space-y-2">
                {history.map((log) => (
                  <li
                    key={log.id}
                    className="border-l-2 border-blue-200 pl-3 py-1 text-xs"
                  >
                    <div className="text-slate-800 font-medium">{log.action || 'Thay đổi'}</div>
                    <div className="text-[10px] text-slate-500">
                      {formatDateTime(log.created_at)} · {log.user?.name || 'Hệ thống'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(profile)}
          className="flex-1 min-w-[80px] py-1.5 border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs"
        >
          Chỉnh sửa
        </button>
        {canSubmit && (
          <button
            type="button"
            onClick={() => onSubmit?.(profile)}
            className="flex-1 min-w-[80px] py-1.5 border border-amber-200 rounded text-amber-700 bg-amber-50 hover:bg-amber-100 font-medium text-xs flex items-center justify-center gap-1"
          >
            <FileClock className="w-3.5 h-3.5" /> Gửi duyệt
          </button>
        )}
        {canInvalidate && (
          <button
            type="button"
            onClick={() => onInvalidate?.(profile)}
            className="flex-1 min-w-[80px] py-1.5 border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs flex items-center justify-center gap-1"
          >
            <ShieldOff className="w-3.5 h-3.5" /> Vô hiệu hoá
          </button>
        )}
        {canReject && (
          <button
            type="button"
            onClick={() => onReject?.(profile)}
            className="flex-1 min-w-[80px] py-1.5 border border-red-200 rounded text-red-600 bg-red-50 hover:bg-red-100 font-medium text-xs flex items-center justify-center gap-1"
          >
            <CircleX className="w-3.5 h-3.5" /> Từ chối
          </button>
        )}
        {canApprove && (
          <button
            type="button"
            onClick={() => onApprove?.(profile)}
            className="flex-1 min-w-[80px] py-1.5 rounded text-white bg-green-600 hover:bg-green-700 font-medium text-xs flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
          </button>
        )}
      </div>
    </aside>
  );
}
