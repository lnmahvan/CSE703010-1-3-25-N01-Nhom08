import React from 'react';
import { Users } from 'lucide-react';

export default function PatientList() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={20} /></div>
        <h3 className="text-xl font-bold text-slate-800">Danh sách bệnh nhân</h3>
      </div>
      <p className="text-slate-500 mt-2">Tính năng đang được phát triển. Danh sách bệnh nhân đã đăng ký sẽ hiển thị tại đây.</p>
    </div>
  );
}
