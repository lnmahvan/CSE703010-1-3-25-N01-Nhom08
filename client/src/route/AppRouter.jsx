import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Layout
import MainLayout from '@/layout/MainLayout';

// Public Pages
import Login from '@/page/Login';
import ForgotPassword from '@/page/ForgotPassword';

// Dashboard Pages (theo vai trò)
import AdminDashboard from '@/page/AdminDashboard';
import DoctorDashboard from '@/page/DoctorDashboard';
import StaffDashboard from '@/page/StaffDashboard';
import AccountantDashboard from '@/page/AccountantDashboard';
import PatientDashboard from '@/page/PatientDashboard';

// Feature Pages
import UserManagement from '@/page/UserManagement';
import StaffManagement from '@/page/StaffManagement';
import SystemSettings from '@/page/SystemSettings';
import PatientList from '@/page/PatientList';
import Appointments from '@/page/Appointments';
import MedicalRecords from '@/page/MedicalRecords';
import InvoiceManagement from '@/page/InvoiceManagement';
import RevenueReport from '@/page/RevenueReport';
import MyAppointments from '@/page/MyAppointments';
import HealthRecords from '@/page/HealthRecords';

// Component bảo vệ route — chuyển hướng về login nếu chưa đăng nhập
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

// Component chọn dashboard theo vai trò
const DashboardByRole = () => {
  const { userRole } = useAuth();
  switch (userRole) {
    case 'admin': return <AdminDashboard />;
    case 'bac_si': return <DoctorDashboard />;
    case 'le_tan': return <StaffDashboard />;
    case 'ke_toan': return <AccountantDashboard />;
    case 'benh_nhan': return <PatientDashboard />;
    default: return <div className="p-10 text-center font-medium">Bạn không có quyền truy cập hệ thống.</div>;
  }
};

const AppRouter = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes — Bọc trong MainLayout */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardByRole />} />

        {/* Admin Routes */}
        <Route path="users" element={<UserManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="settings" element={<SystemSettings />} />

        {/* Shared Routes (Admin, Bác sĩ, Lễ tân) */}
        <Route path="patients" element={<PatientList />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="medical-records" element={<MedicalRecords />} />

        {/* Kế toán Routes */}
        <Route path="invoices" element={<InvoiceManagement />} />
        <Route path="revenue" element={<RevenueReport />} />

        {/* Bệnh nhân Routes */}
        <Route path="my-appointments" element={<MyAppointments />} />
        <Route path="health-records" element={<HealthRecords />} />
      </Route>

      {/* Catch-all — Redirect */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRouter;
