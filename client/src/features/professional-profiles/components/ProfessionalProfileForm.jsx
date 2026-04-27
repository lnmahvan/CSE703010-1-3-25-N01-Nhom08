import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Trash2, FileBadge2, Stethoscope, Calculator, AlertTriangle } from 'lucide-react';
import { CERTIFICATE_TYPE_OPTIONS, PROFILE_ROLE_OPTIONS } from '@/features/professional-profiles/utils';

const sectionClassName = 'rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-4';

export default function ProfessionalProfileForm({
  open,
  mode = 'admin',
  form,
  staffOptions,
  services,
  onClose,
  onChange,
  onAddSpecialty,
  onRemoveSpecialty,
  onUpdateSpecialty,
  onAddCertificate,
  onRemoveCertificate,
  onUpdateCertificate,
  onSubmit,
}) {
  if (!open) return null;

  const isDoctor = form.profile_role === 'bac_si';
  const isSelfService = mode === 'self';
  const roleOptions = isSelfService
    ? PROFILE_ROLE_OPTIONS.filter((option) => option.value === form.profile_role)
    : PROFILE_ROLE_OPTIONS;
  const certificateTypeOptions = CERTIFICATE_TYPE_OPTIONS[form.profile_role] || [];
  const selectedStaff = staffOptions.find((staff) => String(staff.id) === String(form.staff_id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-white rounded-[1.5rem] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                {isDoctor ? <Stethoscope className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
              </div>
              {mode === 'self' ? 'Ho so chuyen mon cua toi' : form.id ? 'Cap nhat ho so chuyen mon' : 'Tao ho so chuyen mon'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[78vh] overflow-y-auto">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="general" className="rounded-lg">Thong tin chung</TabsTrigger>
              <TabsTrigger value="specialties" className="rounded-lg">Chuyen mon</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-lg">Chung chi</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {!isSelfService && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nhan su</Label>
                    <Select value={String(form.staff_id || '')} onValueChange={(value) => onChange('staff_id', value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Chon nhan su" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {staffOptions.map((staff) => (
                          <SelectItem key={staff.id} value={String(staff.id)}>
                            {staff.employee_code} - {staff.full_name} ({staff.role_slug === 'bac_si' ? 'Bac si' : 'Ke toan'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Vai tro ho so</Label>
                  <Select
                    value={form.profile_role || ''}
                    onValueChange={(value) => onChange('profile_role', value)}
                    disabled={isSelfService || Boolean(form.id)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Chon vai tro" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!isSelfService && (
                  <div className="space-y-2">
                    <Label>Trang thai luu</Label>
                    <Select value={form.status || 'draft'} onValueChange={(value) => onChange('status', value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="draft">Chua hoan thien</SelectItem>
                        <SelectItem value="pending">Cho duyet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {selectedStaff && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Ho ten</div>
                    <div className="font-medium text-slate-800">{selectedStaff.full_name}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Email</div>
                    <div className="font-medium text-slate-800">{selectedStaff.email}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Ma nhan su</div>
                    <div className="font-medium text-slate-800">{selectedStaff.employee_code}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Ghi chu</Label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => onChange('notes', e.target.value)}
                  className="w-full min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="Ghi chu ve pham vi cong viec, canh bao hoac yeu cau bo sung"
                />
              </div>
            </TabsContent>

            <TabsContent value="specialties" className="space-y-4">
              {isDoctor ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">Danh sach chuyen mon</h4>
                      <p className="text-sm text-slate-500">Moi chuyen mon co the gan dich vu va chung chi rieng.</p>
                    </div>
                    <Button type="button" onClick={onAddSpecialty} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Them chuyen mon
                    </Button>
                  </div>

                  {form.specialties.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Bac si can it nhat mot chuyen mon de gui duyet.
                    </div>
                  )}

                  {form.specialties.map((specialty, index) => (
                    <div key={specialty.client_key || specialty.id || index} className={sectionClassName}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-800">Chuyen mon #{index + 1}</div>
                        <Button type="button" variant="ghost" onClick={() => onRemoveSpecialty(index)} className="text-red-600 hover:bg-red-50 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Chuyen khoa / chuyen mon</Label>
                          <Input value={specialty.specialty_name} onChange={(e) => onUpdateSpecialty(index, 'specialty_name', e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Hoc vi</Label>
                          <Input value={specialty.degree || ''} onChange={(e) => onUpdateSpecialty(index, 'degree', e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Kinh nghiem (nam)</Label>
                          <Input type="number" min="0" value={specialty.years_experience || 0} onChange={(e) => onUpdateSpecialty(index, 'years_experience', e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Phong / chi nhanh</Label>
                          <Input value={specialty.branch_or_room || ''} onChange={(e) => onUpdateSpecialty(index, 'branch_or_room', e.target.value)} className="rounded-xl" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Dich vu duoc phep thuc hien</Label>
                        <div className="grid md:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                          {services.map((service) => {
                            const checked = (specialty.service_scope || []).includes(service.id);
                            return (
                              <label key={service.id} className="flex items-start gap-3 text-sm text-slate-700">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(next) => {
                                    const current = specialty.service_scope || [];
                                    const nextValue = next
                                      ? [...current, service.id]
                                      : current.filter((id) => id !== service.id);
                                    onUpdateSpecialty(index, 'service_scope', nextValue);
                                  }}
                                />
                                <span>{service.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Ghi chu</Label>
                        <textarea
                          value={specialty.notes || ''}
                          onChange={(e) => onUpdateSpecialty(index, 'notes', e.target.value)}
                          className="w-full min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className={sectionClassName}>
                  <div className="font-medium text-slate-800">Thong tin ke toan</div>
                  <p className="text-sm text-slate-500">Ke toan khong can danh sach chuyen mon con. Hay khai bao pham vi phu trach trong phan chung chi va ghi chu.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="certificates" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800">Chung chi va tai lieu</h4>
                  <p className="text-sm text-slate-500">Cho phep PDF/JPG/PNG toi da 10MB moi tep.</p>
                </div>
                <Button type="button" onClick={onAddCertificate} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Them tai lieu
                </Button>
              </div>

              {form.certificates.length === 0 && (
                <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Can it nhat mot chung chi hoac bang cap.
                </div>
              )}

              {form.certificates.map((certificate, index) => (
                <div key={certificate.id || `cert_${index}`} className={sectionClassName}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-800 flex items-center gap-2">
                      <FileBadge2 className="w-4 h-4 text-teal-600" /> Tai lieu #{index + 1}
                    </div>
                    <Button type="button" variant="ghost" onClick={() => onRemoveCertificate(index)} className="text-red-600 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loai chung chi</Label>
                      <Select value={certificate.certificate_type || ''} onValueChange={(value) => onUpdateCertificate(index, 'certificate_type', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Chon loai" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {certificateTypeOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ten chung chi / bang cap</Label>
                      <Input value={certificate.certificate_name || ''} onChange={(e) => onUpdateCertificate(index, 'certificate_name', e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>So chung chi</Label>
                      <Input value={certificate.certificate_number || ''} onChange={(e) => onUpdateCertificate(index, 'certificate_number', e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Don vi cap</Label>
                      <Input value={certificate.issuer || ''} onChange={(e) => onUpdateCertificate(index, 'issuer', e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ngay cap</Label>
                      <Input type="date" value={certificate.issued_date || ''} onChange={(e) => onUpdateCertificate(index, 'issued_date', e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ngay het han</Label>
                      <Input type="date" value={certificate.expiry_date || ''} onChange={(e) => onUpdateCertificate(index, 'expiry_date', e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>{isDoctor ? 'Dich vu / pham vi ap dung' : 'Mang phu trach'}</Label>
                      <Input value={certificate.scope_label || ''} onChange={(e) => onUpdateCertificate(index, 'scope_label', e.target.value)} className="rounded-xl" />
                    </div>
                    {isDoctor && (
                      <div className="space-y-2">
                        <Label>Gan voi chuyen mon</Label>
                        <Select
                          value={certificate.specialty_client_key || ''}
                          onValueChange={(value) => onUpdateCertificate(index, 'specialty_client_key', value)}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Khong gan chuyen mon cu the" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="general">Khong gan chuyen mon cu the</SelectItem>
                            {form.specialties.map((specialty) => (
                              <SelectItem key={specialty.client_key} value={specialty.client_key}>
                                {specialty.specialty_name || 'Chuyen mon chua dat ten'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tep dinh kem</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => onUpdateCertificate(index, 'file', e.target.files?.[0] || null)}
                        className="rounded-xl"
                      />
                      {certificate.existing_file_name && (
                        <div className="text-xs text-slate-500">Tep hien tai: {certificate.existing_file_name}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Ghi chu</Label>
                      <textarea
                        value={certificate.notes || ''}
                        onChange={(e) => onUpdateCertificate(index, 'notes', e.target.value)}
                        className="w-full min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <Checkbox
                      checked={Boolean(certificate.is_primary)}
                      onCheckedChange={(checked) => onUpdateCertificate(index, 'is_primary', Boolean(checked))}
                    />
                    <span>Danh dau la chung chi chinh</span>
                  </label>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Ho so da luu co the o trang thai Chua hoan thien hoac Cho duyet tuy thao tac.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200">Dong</Button>
            <Button onClick={onSubmit} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
              <Save className="w-4 h-4 mr-2" /> Luu ho so
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
