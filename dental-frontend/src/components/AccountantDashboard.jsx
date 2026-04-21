import React from 'react';
import { DollarSign, FileText, TrendingUp, CreditCard, Inbox } from 'lucide-react';

const AccountantDashboard = ({ activeTab }) => {
  
  // TAB 1: QUẢN LÝ HÓA ĐƠN
  if (activeTab === 'Quản lý hóa đơn') {
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

  // TAB 2: BÁO CÁO DOANH THU
  if (activeTab === 'Báo cáo doanh thu') {
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

  // MẶC ĐỊNH: TAB TỔNG QUAN (Trạng thái rỗng - Empty State)
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800">Tổng quan Tài chính</h2>
        <p className="text-slate-500 mt-1">Theo dõi dòng tiền và trạng thái thanh toán phòng khám hôm nay.</p>
      </div>

      {/* 3 THẺ SỐ LIỆU ĐỀU LÀ 0 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Thực thu hôm nay</p>
          <h3 className="text-4xl font-black text-slate-300 mt-2 italic">0₫</h3>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Hóa đơn chờ thu</p>
          <h3 className="text-4xl font-black text-slate-300 mt-2 italic">0</h3>
          <p className="text-sm text-slate-400 mt-2 font-medium bg-slate-50 w-fit px-2 py-1 rounded-md">0₫</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <CreditCard size={24} />
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Chuyển khoản / Quẹt thẻ</p>
          <h3 className="text-4xl font-black text-slate-300 mt-2 italic">0%</h3>
          <p className="text-sm text-slate-400 mt-2 font-medium bg-slate-50 w-fit px-2 py-1 rounded-md">Chưa có giao dịch</p>
        </div>
      </div>

      {/* BẢNG GIAO DỊCH DẠNG TRỐNG (EMPTY STATE) */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Giao dịch mới nhất</h3>
        </div>
        
        {/* Khu vực thông báo chưa có dữ liệu */}
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Inbox size={32} className="text-slate-300" />
          </div>
          <h4 className="text-lg font-bold text-slate-700">Chưa có giao dịch nào</h4>
          <p className="text-slate-400 mt-1 max-w-sm">
            Các giao dịch thanh toán hoặc hóa đơn mới nhất trong ngày sẽ được hiển thị tại đây.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AccountantDashboard;