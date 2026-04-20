import React, { useState } from 'react';
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
  LogOut // Bổ sung icon Đăng xuất
} from 'lucide-react';

// Nhận thêm prop 'role' và 'userName' từ App.jsx
const MainLayout = ({ children, role = 'benh_nhan', userName = 'Khách hàng' }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 1. CHUẨN HÓA TÊN VAI TRÒ ĐỂ HIỂN THỊ LÊN HEADER
  const roleNames = {
    admin: 'Quản trị viên',
    bac_si: 'Bác sĩ chuyên khoa',
    le_tan: 'Bộ phận Lễ tân',
    benh_nhan: 'Bệnh nhân'
  };

  // 2. PHÂN QUYỀN THANH MENU
  // Cấu hình menu tổng, mục nào có tên role trong mảng 'roles' thì người đó mới được thấy
  const allMenuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', active: true, roles: ['admin', 'bac_si', 'le_tan', 'benh_nhan'] },
    
    // Menu cho Quản lý
    { icon: <Users size={20} />, label: 'Quản lý nhân sự', active: false, roles: ['admin'] },
    { icon: <Settings size={20} />, label: 'Cài đặt hệ thống', active: false, roles: ['admin'] },
    
    // Menu nghiệp vụ phòng khám
    { icon: <Users size={20} />, label: 'Danh sách bệnh nhân', active: false, roles: ['admin', 'bac_si', 'le_tan'] },
    { icon: <Calendar size={20} />, label: 'Lịch hẹn phòng khám', active: false, roles: ['admin', 'bac_si', 'le_tan'] },
    { icon: <ClipboardList size={20} />, label: 'Quản lý bệnh án', active: false, roles: ['admin', 'bac_si'] },
    
    // Menu dành riêng cho Khách hàng/Bệnh nhân
    { icon: <Calendar size={20} />, label: 'Lịch hẹn của tôi', active: false, roles: ['benh_nhan'] },
    { icon: <ClipboardList size={20} />, label: 'Hồ sơ sức khỏe', active: false, roles: ['benh_nhan'] },
  ];

  // Lọc ra các menu mà role hiện tại được phép xem
  const authorizedMenus = allMenuItems.filter(item => item.roles.includes(role));

  // 3. HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); 
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
            <div 
              key={index}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                item.active 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* Nút Đăng xuất ở cuối Sidebar */}
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

          {/* Thanh tìm kiếm - Ẩn đi nếu là bệnh nhân */}
          <div className="flex-1 max-w-md mx-8">
            {role !== 'benh_nhan' && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm bệnh nhân, hồ sơ..." 
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
                <p className="text-sm font-bold text-slate-900">{userName}</p>
                {/* Tự động hiển thị tên Role bằng Tiếng Việt */}
                <p className="text-xs font-medium text-teal-600">{roleNames[role] || 'Người dùng'}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-teal-500 flex items-center justify-center text-teal-700 font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children || (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center text-slate-400">
                <LayoutDashboard size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Nội dung sẽ hiển thị tại đây</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;