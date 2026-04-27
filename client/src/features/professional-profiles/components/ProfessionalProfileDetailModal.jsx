import React from 'react';
import { AlertTriangle, CalendarDays, FileBadge2, FolderKanban, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PROFILE_STATUS_META } from '@/features/professional-profiles/utils';

export default function ProfessionalProfileDetailModal({ open, profile, onClose }) {
  if (!open || !profile) return null;

  const statusMeta = PROFILE_STATUS_META[profile.status] || PROFILE_STATUS_META.draft;
  const isDoctor = profile.profile_role === 'bac_si';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-white rounded-[1.5rem] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              Chi tiet ho so chuyen mon
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <UserRound className="w-4 h-4 text-teal-600" />
                  {profile.staff?.full_name || 'Chua gan nhan su'}
                </div>
                <div className="text-sm text-slate-500">
                  {profile.staff?.employee_code} - {profile.staff?.email}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-slate-100 text-slate-700 border-slate-200">
                  {isDoctor ? 'Bac si' : 'Ke toan'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
                {profile.expiring_soon && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                    Sap het han
                  </span>
                )}
                {profile.has_expired_certificate && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200">
                    Co chung chi qua han
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-5 text-sm">
              <Metric label="Ngay gui duyet" value={formatDate(profile.submitted_at)} />
              <Metric label="Ngay duyet" value={formatDate(profile.approved_at)} />
              <Metric label="Nguoi duyet" value={profile.approver?.name || 'Chua duyet'} />
            </div>

            <div className="mt-4 text-sm">
              <div className="text-slate-500 mb-1">Ghi chu</div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
                {profile.notes || 'Khong co ghi chu'}
              </div>
            </div>

            {profile.rejection_reason && (
              <div className="mt-4 text-sm">
                <div className="text-red-600 mb-1">Ly do tu choi</div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                  {profile.rejection_reason}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              {isDoctor ? 'Danh sach chuyen mon' : 'Thong tin nghiep vu'}
            </div>

            {isDoctor ? (
              (profile.specialties || []).length > 0 ? (
                <div className="grid gap-4">
                  {profile.specialties.map((specialty, index) => (
                    <div key={specialty.id || index} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-800">{specialty.specialty_name}</div>
                          <div className="text-sm text-slate-500">{specialty.degree || 'Chua cap nhat hoc vi'}</div>
                        </div>
                        <div className="text-sm text-slate-600">{specialty.years_experience || 0} nam kinh nghiem</div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <Metric label="Phong / chi nhanh" value={specialty.branch_or_room || 'Chua cap nhat'} />
                        <Metric
                          label="Dich vu duoc phep"
                          value={(specialty.service_scope || []).length > 0 ? specialty.service_scope.join(', ') : 'Chua gan dich vu'}
                        />
                      </div>

                      <div className="text-sm">
                        <div className="text-slate-500 mb-1">Ghi chu</div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                          {specialty.notes || 'Khong co ghi chu'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock text="Chua co chuyen mon nao." />
              )
            ) : (
              <EmptyBlock text="Ho so ke toan khong co danh sach chuyen mon con." />
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <FileBadge2 className="w-4 h-4 text-teal-600" />
              Chung chi va tai lieu
            </div>

            {(profile.certificates || []).length > 0 ? (
              <div className="grid gap-4">
                {profile.certificates.map((certificate, index) => (
                  <div key={certificate.id || index} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-800">{certificate.certificate_name}</div>
                        <div className="text-sm text-slate-500">
                          {certificate.certificate_type} - {certificate.certificate_number}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {certificate.is_primary && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                            Chung chi chinh
                          </span>
                        )}
                        {certificate.is_expiring_soon && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                            Sap het han
                          </span>
                        )}
                        {certificate.is_expired && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200">
                            Het han
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <Metric label="Don vi cap" value={certificate.issuer || 'Chua cap nhat'} />
                      <Metric label="Ngay cap" value={formatDate(certificate.issued_date)} />
                      <Metric label="Ngay het han" value={formatDate(certificate.expiry_date)} />
                      <Metric label="Pham vi ap dung" value={certificate.scope_label || 'Chua cap nhat'} />
                      <Metric label="Tep dinh kem" value={certificate.file_name || 'Chua co tep'} />
                      <Metric label="Chuyen mon lien ket" value={certificate.specialty?.specialty_name || 'Khong gan chuyen mon'} />
                    </div>

                    <div className="text-sm">
                      <div className="text-slate-500 mb-1">Ghi chu</div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                        {certificate.notes || 'Khong co ghi chu'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock text="Chua co chung chi nao." />
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Tong quan xu ly
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <Metric label="Tong chung chi" value={String(profile.certificates?.length || 0)} />
              <Metric label="Tong chuyen mon" value={String(profile.specialties?.length || 0)} />
              <Metric label="Canh bao het han" value={profile.has_expired_certificate ? 'Co' : 'Khong'} />
              <Metric label="Sap het han 30 ngay" value={profile.expiring_soon ? 'Co' : 'Khong'} />
            </div>
          </section>
        </div>

        <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200">Dong</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-slate-500 mb-1">{label}</div>
      <div className="font-medium text-slate-800 break-words">{value || 'Chua cap nhat'}</div>
    </div>
  );
}

function EmptyBlock({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
      {text}
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'Chua cap nhat';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('vi-VN').format(date);
}
