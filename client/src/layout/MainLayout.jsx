import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  FileText,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { userRole, userName, logout } = useAuth();
  const navigate = useNavigate();

  const roleNames = {
    admin: 'Quản trị viên',
    bac_si: 'Bác sĩ chuyên khoa',
    le_tan: 'Bộ phận Lễ tân',
    ke_toan: 'Kế toán',
    benh_nhan: 'Bệnh nhân'
  };

  // Cấu hình danh sách Menu — mỗi item có route path
  const allMenuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', path: '/dashboard', roles: ['admin', 'bac_si', 'le_tan', 'ke_toan', 'benh_nhan'] },

    { icon: <ShieldCheck size={20} />, label: 'Quản lý tài khoản', path: '/users', roles: ['admin'] },
    { icon: <Users size={20} />, label: 'Quản lý nhân sự', path: '/staff', roles: ['admin'] },
    { icon: <Settings size={20} />, label: 'Cài đặt hệ thống', path: '/settings', roles: ['admin'] },

    { icon: <Users size={20} />, label: 'Danh sách bệnh nhân', path: '/patients', roles: ['admin', 'bac_si', 'le_tan'] },
    { icon: <Calendar size={20} />, label: 'Lịch hẹn phòng khám', path: '/appointments', roles: ['admin', 'bac_si', 'le_tan'] },
    { icon: <ClipboardList size={20} />, label: 'Quản lý bệnh án', path: '/medical-records', roles: ['admin', 'bac_si'] },

    { icon: <FileText size={20} />, label: 'Quản lý hóa đơn', path: '/invoices', roles: ['admin', 'ke_toan'] },
    { icon: <TrendingUp size={20} />, label: 'Báo cáo doanh thu', path: '/revenue', roles: ['admin', 'ke_toan'] },

    { icon: <Calendar size={20} />, label: 'Lịch hẹn của tôi', path: '/my-appointments', roles: ['benh_nhan'] },
    { icon: <ClipboardList size={20} />, label: 'Hồ sơ sức khỏe', path: '/health-records', roles: ['benh_nhan'] },
  ];

  const authorizedMenus = allMenuItems.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="font-bold text-xl">D</span>
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight truncate">DENTAL PRO</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {authorizedMenus.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Nút Đăng xuất */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors w-full ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-teal-600 p-2 rounded-lg hover:bg-slate-50 transition-colors">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-1 max-w-md mx-8">
            {userRole !== 'benh_nhan' && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-sm transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-teal-600 transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white">3</span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{userName || 'Người dùng'}</p>
                <p className="text-xs font-medium text-teal-600">{roleNames[userRole] || 'Người dùng'}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-teal-500 flex items-center justify-center text-teal-700 font-bold">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content View — React Router Outlet */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
