import React, { createContext, useState, useContext, useCallback } from 'react';
import { setToken, removeToken, getToken } from '@/service/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Khôi phục trạng thái từ localStorage khi load trang
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Đăng nhập — Lưu token + thông tin user
  const login = useCallback((token, userData) => {
    setToken(token);
    const userInfo = {
      email: userData.email,
      role: userData.role,
      name: userData.name,
      permissions: userData.permission_slugs || [], // Thêm mảng quyền
    };
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
  }, []);

  // Đăng xuất — Xóa tất cả
  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Hàm kiểm tra quyền
  const hasPermission = useCallback((permissionSlug) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permissionSlug);
  }, [user]);

  const value = {
    user,
    isLoggedIn: !!user && !!getToken(),
    userRole: user?.role || '',
    userName: user?.name || '',
    hasPermission,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để dùng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};

export default AuthContext;
