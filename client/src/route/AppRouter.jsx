import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

import MainLayout from '@/layout/MainLayout';

import Login from '@/page/Login';
import ForgotPassword from '@/page/ForgotPassword';

import AdminDashboard from '@/page/AdminDashboard';
import DoctorDashboard from '@/page/DoctorDashboard';
import StaffDashboard from '@/page/StaffDashboard';
import AccountantDashboard from '@/page/AccountantDashboard';
import PatientDashboard from '@/page/PatientDashboard';

import UserManagement from '@/page/UserManagement';
import PermissionManagement from '@/page/PermissionManagement';
import StaffManagement from '@/page/StaffManagement';
import ProfessionalProfileManagement from '@/page/ProfessionalProfileManagement';
import SystemSettings from '@/page/SystemSettings';
import PatientList from '@/page/PatientList';
import Appointments from '@/page/Appointments';
import MedicalRecords from '@/page/MedicalRecords';
import InvoiceManagement from '@/page/InvoiceManagement';
import RevenueReport from '@/page/RevenueReport';
import MyAppointments from '@/page/MyAppointments';
import HealthRecords from '@/page/HealthRecords';
import MyProfessionalProfile from '@/page/MyProfessionalProfile';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const PermissionRoute = ({ permission, children }) => {
  const { hasPermission, userRole } = useAuth();

  if (userRole === 'admin') return children;
  if (permission && !hasPermission(permission)) {
    return <div className="p-10 text-center font-medium text-red-500">Ban khong co quyen truy cap trang nay.</div>;
  }
  return children;
};

const DashboardByRole = () => {
  const { userRole } = useAuth();
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'bac_si':
      return <DoctorDashboard />;
    case 'le_tan':
      return <StaffDashboard />;
    case 'ke_toan':
      return <AccountantDashboard />;
    case 'benh_nhan':
      return <PatientDashboard />;
    default:
      return <div className="p-10 text-center font-medium">Ban khong co quyen truy cap he thong.</div>;
  }
};

const AppRouter = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardByRole />} />

        <Route path="users" element={<PermissionRoute permission="users.view"><UserManagement /></PermissionRoute>} />
        <Route path="permissions" element={<PermissionRoute><PermissionManagement /></PermissionRoute>} />
        <Route path="staff" element={<PermissionRoute permission="staff.view"><StaffManagement /></PermissionRoute>} />
        <Route path="professional-profiles" element={<PermissionRoute permission="professional_profiles.view"><ProfessionalProfileManagement /></PermissionRoute>} />
        <Route path="settings" element={<PermissionRoute><SystemSettings /></PermissionRoute>} />

        <Route path="patients" element={<PermissionRoute permission="patients.view"><PatientList /></PermissionRoute>} />
        <Route path="appointments" element={<PermissionRoute permission="appointments.view"><Appointments /></PermissionRoute>} />
        <Route path="medical-records" element={<PermissionRoute permission="dental_records.view"><MedicalRecords /></PermissionRoute>} />

        <Route path="invoices" element={<PermissionRoute permission="finance.view"><InvoiceManagement /></PermissionRoute>} />
        <Route path="revenue" element={<PermissionRoute permission="reports.view"><RevenueReport /></PermissionRoute>} />
        <Route path="my-professional-profile" element={<MyProfessionalProfile />} />

        <Route path="my-appointments" element={<MyAppointments />} />
        <Route path="health-records" element={<HealthRecords />} />
      </Route>

      <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

export default AppRouter;
