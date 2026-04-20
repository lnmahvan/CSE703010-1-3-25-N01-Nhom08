import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
// Import các Dashboard theo role
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import StaffDashboard from './components/StaffDashboard';
import PatientDashboard from './components/PatientDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleLoginSuccess = (email, role) => {
    setUserRole(role); // Lưu role nhận được từ verify-login-otp
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Hàm để chọn đúng Dashboard hiển thị
  const renderDashboardByRole = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'bac_si':
        return <DoctorDashboard />;
      case 'le_tan':
        return <StaffDashboard />;
      case 'benh_nhan':
        return <PatientDashboard />;
      default:
        return <div className="p-10">Bạn không có quyền truy cập hệ thống.</div>;
    }
  };

  return (
    <MainLayout role={userRole}>
      {renderDashboardByRole()}
    </MainLayout>
  );
}

export default App;