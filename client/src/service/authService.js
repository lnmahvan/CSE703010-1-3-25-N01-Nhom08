const TOKEN_KEY = 'token';

// Lấy token từ localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Lưu token vào localStorage
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Xóa token khỏi localStorage
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Kiểm tra đã đăng nhập chưa
export const isAuthenticated = () => {
  return !!getToken();
};
