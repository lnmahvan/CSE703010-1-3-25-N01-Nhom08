import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserManagement from './UserManagement';
import { Users, Calendar, DollarSign } from 'lucide-react';

const AdminDashboard = ({ activeTab }) => {
  // State lưu trữ dữ liệu thật từ Backend
  const [stats, setStats] = useState({
    total_users: 0,
    appointments_today: 0,
    expected_revenue: 0
  });
  const [loading, setLoading] = useState(true);

  // Hàm format tiền tệ (Ví dụ: 12500000 -> 12.500.000₫)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Lấy dữ liệu khi ở trang Tổng quan
  useEffect(() => {
    // Chỉ gọi API khi ở tab Tổng quan hoặc lần đầu render
    if (!activeTab || activeTab === 'Tổng quan') {
      const fetchStats = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:8000/api/admin/dashboard-stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStats(response.data);
        } catch (error) {
          console.error("Lỗi lấy dữ liệu thống kê:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchStats();
    }
  }, [activeTab]);

  // 1. NẾU BẤM "QUẢN LÝ TÀI KHOẢN" (UC2) -> Gọi Component UserManagement ra hiển thị
  if (activeTab === 'Quản lý tài khoản') {
    return <UserManagement />;
  }

  // 2. NẾU BẤM "QUẢN LÝ NHÂN SỰ" (UC3) -> Hiển thị phần chờ phát triển
  if (activeTab === 'Quản lý nhân sự') {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
        <h3 className="text-xl font-bold text-slate-800">Quản lý hồ sơ nhân sự</h3>
        <p className="text-slate-500 mt-2">Chức năng (UC3) đang được phát triển. Sau này sẽ hiển thị danh sách bằng cấp, chuyên môn, lương của Bác sĩ/Lễ tân ở đây nè.</p>
      </div>
    );
  }

  // 3. NẾU BẤM "CÀI ĐẶT HỆ THỐNG"
  if (activeTab === 'Cài đặt hệ thống') {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
        <h3 className="text-xl font-bold text-slate-800">Cài đặt hệ thống</h3>
        <p className="text-slate-500 mt-2">Tính năng này đang được phát triển...</p>
      </div>
    );
  }

  // MẶC ĐỊNH: HIỂN THỊ TRANG TỔNG QUAN CỦA ADMIN
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
          {/* Card 1: Tổng nhân sự & Bệnh nhân */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Tổng nhân sự & Bệnh nhân</p>
            {/* Hiển thị số lượng thật */}
            <h3 className="text-4xl font-black text-teal-600 mt-2">{stats.total_users}</h3>
          </div>

          {/* Card 2: Lịch hẹn hôm nay */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <Calendar size={24} />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Lịch hẹn hôm nay</p>
            {/* Hiển thị số lượng thật */}
            <h3 className="text-4xl font-black text-blue-600 mt-2">{stats.appointments_today}</h3>
          </div>

          {/* Card 3: Doanh thu dự kiến */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-default">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <DollarSign size={24} />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Doanh thu dự kiến</p>
            {/* Hiển thị doanh thu thật và format sang tiền VNĐ */}
            <h3 className="text-4xl font-black text-purple-600 mt-2">{formatCurrency(stats.expected_revenue)}</h3>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdminDashboard;