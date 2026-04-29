import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const renderStatus = (belowMin) => {
  if (belowMin === 0) {
    return <CheckCircle2 size={12} className="text-green-500" />;
  }
  if (belowMin === 1) {
    return <AlertTriangle size={12} className="text-orange-500" />;
  }
  return <Info size={12} className="text-red-500" />;
};

const BranchStatsCard = ({ stats, fromLabel, toLabel }) => (
  <div className="bg-white border rounded-lg shadow-sm p-4">
    <h3 className="font-semibold text-gray-800 mb-3 text-[13px]">
      Thống kê nhân sự theo chi nhánh ({fromLabel} - {toLabel})
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs min-w-[480px]">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="pb-2 font-medium">Chi nhánh</th>
            <th className="pb-2 font-medium text-center">Tổng nhân sự</th>
            <th className="pb-2 font-medium text-center">Đã phân công</th>
            <th className="pb-2 font-medium text-center">Thiếu tối thiểu</th>
            <th className="pb-2 font-medium text-center">Tạm nghỉ</th>
            <th className="pb-2 font-medium text-center">Nghỉ việc</th>
          </tr>
        </thead>
        <tbody>
          {stats.length === 0 && (
            <tr>
              <td colSpan={6} className="py-4 text-center text-gray-400">
                Chưa có dữ liệu
              </td>
            </tr>
          )}
          {stats.map((row) => (
            <tr key={row.branch_id} className="border-b last:border-b-0">
              <td className="py-2 text-gray-700">{row.branch_name}</td>
              <td className="py-2 text-center">{row.total_staff}</td>
              <td className="py-2 text-center">{row.assigned}</td>
              <td className="py-2 text-center">{row.below_min}</td>
              <td className="py-2 text-center">{row.suspended}</td>
              <td className="py-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  {row.resigned} {renderStatus(row.below_min)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default BranchStatsCard;
