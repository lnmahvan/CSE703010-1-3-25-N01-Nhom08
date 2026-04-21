import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import StaffDashboard from './components/StaffDashboard';
import PatientDashboard from './components/PatientDashboard';
import AccountantDashboard from './components/AccountantDashboard'; // Đã import Kế toán

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  
  // Sợi dây liên kết để biết đang chọn Menu nào
  const [activeTab, setActiveTab] = useState('Tổng quan'); 

  const handleLoginSuccess = (email, role, name) => {
    setUserRole(role);
    setUserName(name || email);
    setIsLoggedIn(true);
    setActiveTab('Tổng quan'); // Mặc định khi vào là Tổng quan
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Chọn đúng giao diện tùy theo Role
  const renderDashboardByRole = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard activeTab={activeTab} />;
      case 'bac_si':
        return <DoctorDashboard activeTab={activeTab} />;
      case 'le_tan':
        return <StaffDashboard activeTab={activeTab} />;
      case 'ke_toan': // Thêm case cho Kế Toán
        return <AccountantDashboard activeTab={activeTab} />;
      case 'benh_nhan':
        return <PatientDashboard activeTab={activeTab} />;
      default:
        return <div className="p-10 text-center font-medium">Bạn không có quyền truy cập hệ thống.</div>;
    }
  };

  return (
    <MainLayout 
      role={userRole} 
      userName={userName}
      activeTab={activeTab}           // Truyền xuống MainLayout
      setActiveTab={setActiveTab}     // Truyền hàm đổi tab xuống MainLayout
    >
      {renderDashboardByRole()}
    </MainLayout>
  );
}

export default App;