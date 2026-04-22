import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign } from 'lucide-react';
import { getAdminStats } from '@/api/dashboardApi';
import { formatCurrency } from '@/lib/utils';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    appointments_today: 0,
    expected_revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await getAdminStats();
        setStats(response.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800">Bảng điều khiển Quản trị</h2>
        <p className="text-slate-500 mt-1">Tổng quan hoạt động của phòng khám hôm nay được lấy trực tiếp từ hệ thống.</p>
      </div>

      {loading ? (
        <div className="text-slate-400 animate-pulse font-medium">Đang tải dữ liệu thực tế...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4"><Users size={24} /></div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Tổng nhân sự & Bệnh nhân</p>
            <h3 className="text-4xl font-black text-teal-600 mt-2">{stats.total_users}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4"><Calendar size={24} /></div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Lịch hẹn hôm nay</p>
            <h3 className="text-4xl font-black text-blue-600 mt-2">{stats.appointments_today}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4"><DollarSign size={24} /></div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Doanh thu dự kiến</p>
            <h3 className="text-4xl font-black text-purple-600 mt-2">{formatCurrency(stats.expected_revenue)}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
