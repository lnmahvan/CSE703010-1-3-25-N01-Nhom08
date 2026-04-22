// WebSocket Configuration
// Placeholder — Sẽ cấu hình khi triển khai tính năng real-time
// Ví dụ: thông báo lịch hẹn, cập nhật trạng thái bệnh nhân...

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:6001';

export const socketConfig = {
  url: SOCKET_URL,
  options: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  },
};

export default socketConfig;
