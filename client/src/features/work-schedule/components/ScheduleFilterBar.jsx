import React from 'react';
import { Search } from 'lucide-react';
import { ROLE_LABEL, SCHEDULE_STATUS_LABEL } from '../constants';

const ScheduleFilterBar = ({ filters, branches, staffList, onChange }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white p-3 border rounded-lg shadow-sm flex items-end gap-3 flex-wrap">
      <div className="flex-1 min-w-[140px]">
        <label className="text-[11px] text-gray-500 block mb-1">Chi nhánh</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.branch_id}
          onChange={(e) => update('branch_id', e.target.value)}
        >
          <option value="all">Tất cả</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="text-[11px] text-gray-500 block mb-1">Vai trò</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.role}
          onChange={(e) => update('role', e.target.value)}
        >
          <option value="all">Tất cả</option>
          {Object.entries(ROLE_LABEL)
            .filter(([slug]) => slug !== 'admin' && slug !== 'benh_nhan')
            .map(([slug, label]) => (
              <option key={slug} value={slug}>{label}</option>
            ))}
        </select>
      </div>

      <div className="flex-1 min-w-[160px]">
        <label className="text-[11px] text-gray-500 block mb-1">Nhân sự</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.staff_id}
          onChange={(e) => update('staff_id', e.target.value)}
        >
          <option value="all">Tất cả</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} {s.employee_code ? `· ${s.employee_code}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="text-[11px] text-gray-500 block mb-1">Trạng thái</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="all">Tất cả</option>
          {Object.entries(SCHEDULE_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="flex-[1.5] min-w-[200px]">
        <label className="text-[11px] text-gray-500 block mb-1">Tìm kiếm nhân sự</label>
        <div className="relative">
          <Search size={14} className="absolute left-2 top-2 text-gray-400" />
          <input
            type="text"
            placeholder="Tên hoặc mã nhân sự..."
            className="w-full pl-7 pr-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilterBar;
