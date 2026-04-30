import React from 'react';

const ServiceFilterBar = ({ filters, groups, specialties, onChange, onReset }) => {
  return (
    <div className="p-3 border-b flex gap-3 flex-wrap bg-gray-50/30">
      <div className="flex-[1.5] min-w-[150px]">
        <label className="text-[11px] text-gray-500 block mb-1">Tìm kiếm</label>
        <input
          type="text"
          placeholder="Nhập mã, tên dịch vụ..."
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          className="w-full border rounded px-2 py-1.5 focus:outline-none text-xs bg-white"
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="text-[11px] text-gray-500 block mb-1">Nhóm dịch vụ</label>
        <select
          value={filters.service_group_id}
          onChange={(e) => onChange('service_group_id', e.target.value)}
          className="w-full border rounded px-2 py-1.5 focus:outline-none text-xs bg-white"
        >
          <option value="all">Tất cả</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[100px]">
        <label className="text-[11px] text-gray-500 block mb-1">Trạng thái</label>
        <select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full border rounded px-2 py-1.5 focus:outline-none text-xs bg-white"
        >
          <option value="all">Tất cả</option>
          <option value="draft">Nháp</option>
          <option value="active">Đang áp dụng</option>
          <option value="hidden">Tạm ẩn</option>
          <option value="discontinued">Ngừng áp dụng</option>
        </select>
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="text-[11px] text-gray-500 block mb-1">Chuyên môn chính</label>
        <select
          value={filters.specialty_id}
          onChange={(e) => onChange('specialty_id', e.target.value)}
          className="w-full border rounded px-2 py-1.5 focus:outline-none text-xs bg-white"
        >
          <option value="all">Tất cả</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[100px]">
        <label className="text-[11px] text-gray-500 block mb-1">Phạm vi hiển thị</label>
        <select
          value={filters.visibility}
          onChange={(e) => onChange('visibility', e.target.value)}
          className="w-full border rounded px-2 py-1.5 focus:outline-none text-xs bg-white"
        >
          <option value="all">Tất cả</option>
          <option value="public">Công khai</option>
          <option value="internal">Nội bộ</option>
        </select>
      </div>
      <div className="flex items-end pb-[2px]">
        <button
          onClick={onReset}
          className="px-3 py-1.5 border rounded bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-1"
        >
          ↻ Làm mới
        </button>
      </div>
    </div>
  );
};

export default ServiceFilterBar;
