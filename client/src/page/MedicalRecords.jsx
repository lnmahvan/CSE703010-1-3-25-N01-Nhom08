import React from 'react';
import { ClipboardList } from 'lucide-react';

export default function MedicalRecords() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><ClipboardList size={20} /></div>
        <h3 className="text-xl font-bold text-slate-800">Quản lý bệnh án</h3>
      </div>
      <p className="text-slate-500 mt-2">Tính năng đang được phát triển. Hồ sơ bệnh án của bệnh nhân sẽ hiển thị tại đây.</p>
    </div>
  );
}
