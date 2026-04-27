import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle2, CircleX, Eye, FileClock, History, Plus, RefreshCcw, Search, ShieldOff, SquarePen } from 'lucide-react';
import { PROFILE_ROLE_OPTIONS, PROFILE_STATUS_META } from '@/features/professional-profiles/utils';

const statusOptions = ['all', 'draft', 'pending', 'approved', 'expired', 'rejected', 'inactive'];

export default function ProfessionalProfileTable({
  profiles,
  loading,
  searchTerm,
  filterRole,
  filterStatus,
  currentPage,
  totalPages,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onRefresh,
  onCreate,
  onView,
  onEdit,
  onApprove,
  onReject,
  onInvalidate,
  onSubmit,
  onOpenHistory,
  onPageChange,
}) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tim theo nhan su, ma ho so hoac so chung chi"
            className="pl-10 rounded-xl"
          />
        </div>

        <Select value={filterRole} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Tat ca vai tro</SelectItem>
            {PROFILE_ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? 'Tat ca trang thai' : PROFILE_STATUS_META[status]?.label || status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-xl border-slate-200">
          <RefreshCcw className="w-4 h-4" />
        </Button>

        <Button onClick={onCreate} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Tao ho so
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/60">
              <TableHead>Nhan su</TableHead>
              <TableHead>Vai tro</TableHead>
              <TableHead>Trang thai</TableHead>
              <TableHead>Chung chi</TableHead>
              <TableHead>Canh bao</TableHead>
              <TableHead className="text-right">Thao tac</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-500">Dang tai du lieu...</TableCell></TableRow>
            ) : profiles.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-500">Chua co ho so chuyen mon nao</TableCell></TableRow>
            ) : profiles.map((profile) => {
              const meta = PROFILE_STATUS_META[profile.status] || PROFILE_STATUS_META.draft;
              const warningText = profile.has_expired_certificate
                ? 'Co chung chi qua han'
                : profile.expiring_soon
                  ? 'Co chung chi sap het han'
                  : 'Khong co canh bao';

              return (
                <TableRow key={profile.id} className="group hover:bg-slate-50/50">
                  <TableCell>
                    <div className="font-medium text-slate-800">{profile.staff?.full_name}</div>
                    <div className="text-xs text-slate-500">{profile.staff?.employee_code} - {profile.staff?.email}</div>
                  </TableCell>
                  <TableCell>{profile.profile_role === 'bac_si' ? 'Bac si' : 'Ke toan'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${meta.className}`}>
                      {meta.label}
                    </span>
                  </TableCell>
                  <TableCell>{profile.certificates_count || profile.certificates?.length || 0}</TableCell>
                  <TableCell>
                    <div className={`text-sm flex items-center gap-2 ${profile.has_expired_certificate ? 'text-red-600' : profile.expiring_soon ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {profile.has_expired_certificate ? <CircleX className="w-4 h-4" /> : profile.expiring_soon ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      {warningText}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => onView(profile)} className="rounded-lg text-slate-700 hover:bg-slate-100" title="Xem chi tiet">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(profile)} className="rounded-lg">
                        <SquarePen className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onSubmit(profile)} className="rounded-lg text-amber-700 hover:bg-amber-50" title="Chuyen cho duyet">
                        <FileClock className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onApprove(profile)} className="rounded-lg text-emerald-700 hover:bg-emerald-50" title="Duyet">
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onReject(profile)} className="rounded-lg text-red-700 hover:bg-red-50" title="Tu choi">
                        <CircleX className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onInvalidate(profile)} className="rounded-lg text-slate-700 hover:bg-slate-100" title="Vo hieu hoa">
                        <ShieldOff className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onOpenHistory(profile)} className="rounded-lg" title="Lich su">
                        <History className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">Trang {currentPage} / {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Truoc</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau</Button>
          </div>
        </div>
      )}
    </div>
  );
}
