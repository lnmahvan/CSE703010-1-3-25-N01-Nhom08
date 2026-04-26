import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, User, Phone, Briefcase, FileBadge } from 'lucide-react';

const StaffFormModal = ({
  open,
  isEditing,
  formData,
  availableRoles,
  onClose,
  onChange,
  onSubmit
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

        <div className="p-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/50 p-1 rounded-xl">
              <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700 transition-all flex items-center gap-2">
                <User className="w-4 h-4" /> Cá nhân
              </TabsTrigger>
              <TabsTrigger value="contact" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700 transition-all flex items-center gap-2">
                <Phone className="w-4 h-4" /> Liên hệ
              </TabsTrigger>
              <TabsTrigger value="work" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700 transition-all flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Công việc
              </TabsTrigger>
            </TabsList>

            <div className="min-h-[250px]">
              <TabsContent value="personal" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Mã nhân viên</Label>
                    <Input 
                      placeholder={isEditing ? formData.employee_code : "Hệ thống tự động sinh"} 
                      value={formData.employee_code} 
                      disabled
                      className="rounded-xl border-slate-200 bg-slate-50 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="Nguyễn Văn A" 
                      value={formData.full_name} 
                      onChange={(e) => onChange('full_name', e.target.value)} 
                      className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Email <span className="text-red-500">*</span></Label>
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

              <TabsContent value="work" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Vai trò hệ thống <span className="text-red-500">*</span></Label>
                    <Select value={formData.role_slug} onValueChange={(val) => onChange('role_slug', val)}>
                      <SelectTrigger className="rounded-xl border-slate-200 hover:border-teal-500 transition-colors">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50 shadow-xl border-slate-100 rounded-xl overflow-hidden">
                        {availableRoles.map(r => (
                          <SelectItem key={r.slug} value={r.slug} className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer">{r.name}</SelectItem>
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
                  <Select value={formData.status} onValueChange={(val) => onChange('status', val)}>
                    <SelectTrigger className="rounded-xl border-slate-200 hover:border-teal-500 transition-colors">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 shadow-xl border-slate-100 rounded-xl overflow-hidden">
                      <SelectItem value="working" className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer">Đang làm việc</SelectItem>
                      <SelectItem value="suspended" className="hover:bg-amber-50 focus:bg-amber-50 cursor-pointer">Tạm nghỉ (Khóa tài khoản)</SelectItem>
                      <SelectItem value="resigned" className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">Nghỉ việc (Khóa tài khoản)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!isEditing && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    Hệ thống sẽ tự động tạo Tài khoản đăng nhập tương ứng với Email và gửi Mật khẩu nếu cần.
                  </p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            <span className="text-red-500">*</span> là thông tin bắt buộc
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200 hover:bg-slate-100">
              <X className="w-4 h-4 mr-2" /> Hủy
            </Button>
            <Button onClick={onSubmit} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
              <Save className="w-4 h-4 mr-2" /> Lưu hồ sơ
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffFormModal;
