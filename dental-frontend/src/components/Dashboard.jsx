import React from 'react';
import { Users, CalendarCheck, TrendingUp, Clock } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Bệnh nhân hôm nay', value: '24', icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600' },
    { title: 'Lịch hẹn sắp tới', value: '8', icon: <CalendarCheck size={24} />, color: 'bg-teal-50 text-teal-600' },
    { title: 'Doanh thu trong ngày', value: '15.4M', icon: <TrendingUp size={24} />, color: 'bg-emerald-50 text-emerald-600' },
  ];

  const upcomingAppointments = [
    { id: 'BN001', name: 'Trần Văn A', time: '09:00', service: 'Nhổ răng khôn', doctor: 'Bs. Hoàng', status: 'Đang chờ' },
    { id: 'BN002', name: 'Nguyễn Thị B', time: '09:30', service: 'Niềng răng (Tái khám)', doctor: 'Bs. Lan', status: 'Sắp đến' },
    { id: 'BN003', name: 'Lê Văn C', time: '10:00', service: 'Tẩy trắng răng', doctor: 'Bs. Hoàng', status: 'Sắp đến' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Lời chào */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Chào buổi sáng, Tuệ Minh! 👋</h1>
        <p className="text-slate-500 mt-1">Dưới đây là tổng quan tình hình phòng khám hôm nay.</p>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bảng lịch hẹn sắp tới */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-teal-600" /> 
            Lịch hẹn tiếp theo
          </h2>
          <button className="text-sm font-medium text-teal-600 hover:text-teal-700">Xem tất cả</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">THỜI GIAN</th>
                <th className="p-4 font-medium">BỆNH NHÂN</th>
                <th className="p-4 font-medium">DỊCH VỤ</th>
                <th className="p-4 font-medium">BÁC SĨ</th>
                <th className="p-4 font-medium">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {upcomingAppointments.map((apt, index) => (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{apt.time}</td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{apt.name}</p>
                    <p className="text-xs text-slate-500">{apt.id}</p>
                  </td>
                  <td className="p-4 text-slate-600">{apt.service}</td>
                  <td className="p-4 text-slate-600">{apt.doctor}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      apt.status === 'Đang chờ' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;