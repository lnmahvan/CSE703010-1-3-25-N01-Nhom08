import React from 'react';

export default function PatientDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-teal-700 mb-4">Hồ sơ sức khỏe của tôi</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-600">Chào mừng bạn! Tại đây bạn có thể xem lịch hẹn và lịch sử khám răng của mình.</p>
      </div>
    </div>
  );
}
