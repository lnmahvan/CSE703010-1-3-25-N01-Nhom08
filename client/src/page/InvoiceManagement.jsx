import React from 'react';
import { FileText } from 'lucide-react';

export default function InvoiceManagement() {
  return (
    <div className="animate-in fade-in bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <FileText className="text-teal-600" /> Quản lý hóa đơn chờ thu
      </h3>
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center text-slate-400">
        <FileText size={48} className="opacity-20 mb-4" />
        <p className="font-medium text-lg">Chưa có hóa đơn nào</p>
        <p className="text-sm mt-2">Dữ liệu sẽ xuất hiện khi có bệnh nhân hoàn thành khám.</p>
      </div>
    </div>
  );
}
