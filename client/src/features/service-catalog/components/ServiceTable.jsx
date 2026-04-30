import React from 'react';
import { formatVnd, statusLabel, visibilityLabel } from '../utils';
import { STATUS_BADGE_CLASS } from '../constants';

const ServiceTable = ({ items, selectedId, onSelect, onEdit, loading, page, perPage }) => {
  if (loading) {
    return <div className="p-6 text-center text-xs text-gray-500">Đang tải...</div>;
  }
  if (!items.length) {
    return <div className="p-6 text-center text-xs text-gray-500">Không có dịch vụ nào.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="text-xs text-gray-500 border-b bg-gray-50/50">
            <th className="py-2.5 px-3 font-medium w-10 text-center">STT</th>
            <th className="py-2.5 px-3 font-medium">Mã dịch vụ</th>
            <th className="py-2.5 px-3 font-medium">Tên dịch vụ</th>
            <th className="py-2.5 px-3 font-medium">Nhóm dịch vụ</th>
            <th className="py-2.5 px-3 font-medium text-right">Giá hiện tại</th>
            <th className="py-2.5 px-3 font-medium">Chuyên môn chính</th>
            <th className="py-2.5 px-3 font-medium text-center">Phạm vi hiển thị</th>
            <th className="py-2.5 px-3 font-medium text-center">Trạng thái</th>
            <th className="py-2.5 px-3 font-medium text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="text-[12px]">
          {items.map((item, idx) => {
            const primary = (item.specialties || []).find((s) => s.pivot?.is_primary);
            const isSelected = selectedId === item.id;
            const stt = (page - 1) * perPage + idx + 1;
            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`border-b cursor-pointer ${
                  isSelected ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="py-2 px-3 text-center text-gray-500">{stt}</td>
                <td className="py-2 px-3 font-medium text-gray-900">{item.service_code}</td>
                <td className="py-2 px-3 text-gray-800">{item.name}</td>
                <td className="py-2 px-3 text-gray-600">{item.group?.name || '-'}</td>
                <td className="py-2 px-3 text-right">{formatVnd(item.price)}</td>
                <td className="py-2 px-3 text-gray-600">{primary?.name || '-'}</td>
                <td className="py-2 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-600 border border-gray-200">
                    {visibilityLabel(item.visibility)}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] border inline-block w-24 ${
                      STATUS_BADGE_CLASS[item.status] || ''
                    }`}
                  >
                    {statusLabel(item.status)}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex justify-center gap-1.5">
                    <button
                      title="Xem"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item.id);
                      }}
                      className="p-1 border rounded bg-white text-gray-500 hover:bg-gray-50"
                    >
                      👁
                    </button>
                    <button
                      title="Sửa"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                      className="p-1 border rounded bg-white text-gray-500 hover:bg-gray-50"
                    >
                      ✎
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTable;
