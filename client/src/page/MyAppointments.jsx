import React from 'react';
import { Calendar } from 'lucide-react';

export default function MyAppointments() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
        <h3 className="text-xl font-bold text-slate-800">Lịch hẹn của tôi</h3>
      </div>
      <p className="text-slate-500 mt-2">Tính năng đang được phát triển. Lịch hẹn cá nhân của bạn sẽ hiển thị tại đây.</p>
    </div>
  );
}
