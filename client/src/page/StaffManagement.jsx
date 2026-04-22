import React from 'react';
import { Users } from 'lucide-react';

export default function StaffManagement() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center"><Users size={20} /></div>
        <h3 className="text-xl font-bold text-slate-800">Quản lý hồ sơ nhân sự</h3>
      </div>
      <p className="text-slate-500 mt-2">Chức năng (UC3) đang được phát triển. Sau này sẽ hiển thị danh sách bằng cấp, chuyên môn, lương của Bác sĩ/Lễ tân ở đây.</p>
    </div>
  );
}
