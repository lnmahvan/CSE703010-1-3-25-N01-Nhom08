import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function RevenueReport() {
  return (
    <div className="animate-in fade-in bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <TrendingUp className="text-teal-600" /> Thống kê doanh thu
      </h3>
      <div className="h-80 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
        <TrendingUp size={48} className="opacity-20 mb-4" />
        <p className="font-medium text-lg">Chưa có dữ liệu thống kê</p>
        <p className="text-sm mt-2">Biểu đồ sẽ tự động cập nhật khi có phát sinh doanh thu.</p>
      </div>
    </div>
  );
}
