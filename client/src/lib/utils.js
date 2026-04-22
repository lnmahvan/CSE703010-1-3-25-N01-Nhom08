// Format số tiền sang định dạng VNĐ (Ví dụ: 12500000 → 12.500.000₫)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

// Kết hợp class names (tiện cho conditional classes)
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
