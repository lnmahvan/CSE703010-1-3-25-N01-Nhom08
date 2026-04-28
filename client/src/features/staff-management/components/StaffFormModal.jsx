import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, User, GraduationCap, Wallet } from 'lucide-react';

const StaffFormModal = ({
  open,
  isEditing,
  formData,
  availableRoles,
  onClose,
  onChange,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                <User size={18} />
              </div>
              {isEditing ? 'Cập nhật hồ sơ nhân sự' : 'Thêm nhân sự mới'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/50 p-1 rounded-xl">
              <TabsTrigger
                value="general"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700 transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Thông tin chung
              </TabsTrigger>
              <TabsTrigger
                value="qualification"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700 transition-all flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" /> Chuyên môn
              </TabsTrigger>
              <TabsTrigger
                value="compensation"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700 transition-all flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" /> Hợp đồng & Đãi ngộ
              </TabsTrigger>
            </TabsList>

            <div className="min-h-[260px]">
              <TabsContent
                value="general"
                className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Mã nhân viên</Label>
                    <Input
                      placeholder={isEditing ? formData.employee_code : 'Hệ thống tự động sinh'}
                      value={formData.employee_code}
                      disabled
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Nguyễn Văn A"
                      value={formData.full_name}
                      onChange={(e) => onChange('full_name', e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Ngày sinh</Label>
                    <Input
                      type="date"
                      value={formData.birthday || ''}
                      onChange={(e) => onChange('birthday', e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Giới tính</Label>
                    <Select
                      value={formData.gender || ''}
                      onValueChange={(val) => onChange('gender', val)}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 hover:border-teal-500 transition-colors">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50 shadow-xl border-slate-100 rounded-xl overflow-hidden">
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">CCCD/CMND</Label>
                    <Input
                      placeholder="001090123456"
                      value={formData.id_card || ''}
                      onChange={(e) => onChange('id_card', e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-600 mt-1 select-none">
                      <input
                        type="checkbox"
                        checked={!!formData.id_card_verified}
                        onChange={(e) => onChange('id_card_verified', e.target.checked)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      Đã xác thực CCCD
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Quốc tịch</Label>
                    <Input
                      placeholder="Việt Nam"
                      value={formData.nationality || ''}
                      onChange={(e) => onChange('nationality', e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => onChange('email', e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Số điện thoại</Label>
                    <Input
                      placeholder="0987654321"
                      value={formData.phone}
                      onChange={(e) => onChange('phone', e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="qualification"
                className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Vai trò hệ thống <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.role_slug}
                      onValueChange={(val) => onChange('role_slug', val)}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 hover:border-teal-500 transition-colors">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50 shadow-xl border-slate-100 rounded-xl overflow-hidden">
                        {availableRoles.map((r) => (
                          <SelectItem
                            key={r.slug}
                            value={r.slug}
                            className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer"
                          >
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Ngày vào làm</Label>
                    <Input
                      type="date"
                      value={formData.join_date}
                      onChange={(e) => onChange('join_date', e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-slate-700 font-medium">Trạng thái công việc</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => onChange('status', val)}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 hover:border-teal-500 transition-colors">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 shadow-xl border-slate-100 rounded-xl overflow-hidden">
                      <SelectItem value="working">Đang làm việc</SelectItem>
                      <SelectItem value="suspended">Tạm nghỉ (Khóa tài khoản)</SelectItem>
                      <SelectItem value="resigned">Nghỉ việc (Khóa tài khoản)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!isEditing && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    Hệ thống sẽ tự động tạo Tài khoản đăng nhập tương ứng với Email và sinh mật khẩu ngẫu nhiên. Quản trị có thể đặt lại mật khẩu sau ở khung Chi tiết nhân sự.
                  </p>
                )}
              </TabsContent>

              <TabsContent
                value="compensation"
                className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex flex-col items-center justify-center text-center py-12 px-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">
                    Thông tin hợp đồng & đãi ngộ
                  </h4>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Mức lương cơ bản, hình thức trả lương, tài khoản ngân hàng và mã số thuế sẽ được quản lý ở khung Chi tiết nhân sự hoặc môdule tính lương (sắp ra mắt).
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            <span className="text-red-500">*</span> là thông tin bắt buộc
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-slate-200 hover:bg-slate-100"
            >
              <X className="w-4 h-4 mr-2" /> Hủy
            </Button>
            <Button
              onClick={onSubmit}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" /> Lưu hồ sơ
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffFormModal;
