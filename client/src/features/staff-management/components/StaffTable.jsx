import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Lock, Unlock, History, RefreshCcw } from 'lucide-react';

const StaffTable = ({
  staffList,
  availableRoles,
  loading,
  currentPage,
  totalPages,
  searchTerm,
  filterRoleId,
  filterStatus,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onOpenHistory,
  onOpenCreate,
  onEdit,
  onToggleStatus,
  onPageChange,
}) => {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-1 items-center gap-4 w-full">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Tìm theo Mã NV, Tên, Email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          
          <Select value={filterRoleId} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-[180px] rounded-xl border-slate-200 hover:border-teal-500 transition-colors">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50 shadow-xl border-slate-100 rounded-xl overflow-hidden">
              <SelectItem value="all" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer">Tất cả vai trò</SelectItem>
              {availableRoles.map(r => (
                <SelectItem key={r.slug} value={r.slug} className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer">{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px] rounded-xl border-slate-200 hover:border-teal-500 transition-colors">
              <SelectValue placeholder="Trạng thái làm việc" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50 shadow-xl border-slate-100 rounded-xl overflow-hidden">
              <SelectItem value="all" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer">Tất cả trạng thái</SelectItem>
              <SelectItem value="working" className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer">Đang làm việc</SelectItem>
              <SelectItem value="suspended" className="hover:bg-amber-50 focus:bg-amber-50 cursor-pointer">Tạm nghỉ</SelectItem>
              <SelectItem value="resigned" className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">Nghỉ việc</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onPageChange(1)}
            className="rounded-xl ml-auto border-slate-200 text-slate-500 hover:text-teal-600 hover:bg-teal-50"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          onClick={onOpenCreate}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân sự
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-semibold text-slate-600">Mã NV</TableHead>
              <TableHead className="font-semibold text-slate-600">Họ tên</TableHead>
              <TableHead className="font-semibold text-slate-600">Vai trò</TableHead>
              <TableHead className="font-semibold text-slate-600">Liên hệ</TableHead>
              <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-slate-500">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : staffList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-slate-500">Không tìm thấy hồ sơ nào</TableCell>
              </TableRow>
            ) : (
              staffList.map((staff) => (
                <TableRow key={staff.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-700">{staff.employee_code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {staff.avatar ? (
                          <img src={staff.avatar} alt={staff.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          staff.full_name.charAt(0)
                        )}
                      </div>
                      <span className="font-medium text-slate-800">{staff.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {availableRoles.find(r => r.slug === staff.role_slug)?.name || staff.role_slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">{staff.phone || 'Chưa cập nhật'}</div>
                    <div className="text-xs text-slate-400">{staff.email}</div>
                  </TableCell>
                  <TableCell>
                    {staff.status === 'working' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Đang làm việc</span>}
                    {staff.status === 'suspended' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Tạm nghỉ</span>}
                    {staff.status === 'resigned' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Nghỉ việc</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(staff)} className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onToggleStatus(staff.id, staff.status)} 
                        className={`h-8 w-8 rounded-lg ${staff.status === 'working' ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        title={staff.status === 'working' ? 'Cho tạm nghỉ' : 'Đi làm lại'}
                      >
                        {staff.status === 'working' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onOpenHistory(staff.id)} className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-500">Trang {currentPage} / {totalPages}</div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl border-slate-200"
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-xl border-slate-200"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTable;
