import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-teal-700 mb-4">Bảng điều khiển Quản trị viên</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-600">Tại đây Admin có thể xem báo cáo doanh thu và quản lý tài khoản nhân viên.</p>
        {/* Sau này Minh sẽ code các biểu đồ và bảng nhân viên ở đây */}
      </div>
    </div>
  );
}