import React from 'react';
import { History, X } from 'lucide-react';

const UserHistoryModal = ({ open, historyLogs, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="text-teal-600" /> Lich su thay doi he thong
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-slate-100">Thoi gian</th>
                <th className="px-6 py-4 font-bold border-b border-slate-100">Nguoi thuc hien</th>
                <th className="px-6 py-4 font-bold border-b border-slate-100">Hanh dong</th>
                <th className="px-6 py-4 font-bold border-b border-slate-100">Noi dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-500">
                    Chua co lich su thay doi nao trong he thong.
                  </td>
                </tr>
              ) : (
                historyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{log.admin_name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Dong
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHistoryModal;
