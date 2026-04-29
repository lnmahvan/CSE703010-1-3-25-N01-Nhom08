import React from 'react';
import { fmtVnDateTime } from '../utils';

const AuditLogCard = ({ logs }) => (
  <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col">
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-semibold text-gray-800 text-[13px]">Lịch sử thao tác (Audit Log)</h3>
    </div>
    <div className="flex-1 overflow-y-auto pr-2 max-h-[280px]">
      <table className="w-full text-left text-[11px]">
        <tbody>
          {logs.length === 0 && (
            <tr>
              <td className="py-4 text-center text-gray-400" colSpan={3}>
                Chưa có thao tác nào.
              </td>
            </tr>
          )}
          {logs.map((log) => (
            <tr key={log.id} className="border-b hover:bg-gray-50 last:border-b-0">
              <td className="py-1.5 text-gray-500 w-32 align-top">{fmtVnDateTime(log.created_at)}</td>
              <td className="py-1.5 font-medium w-24 align-top">{log.admin_name}</td>
              <td className="py-1.5 text-gray-600 align-top">{log.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AuditLogCard;
