import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  History,
  KeyRound,
  Lock,
  Search,
  Unlock,
  UserPlus,
} from 'lucide-react';

const UserManagementTable = ({
  users,
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
  onResetPassword,
  onToggleStatus,
  onPageChange,
}) => {
  return (
    <>
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
        <h3 className="text-xl font-bold text-slate-800">Quan ly Tai khoan</h3>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tim ten, username, ma..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
          </div>

          <select
            value={filterRoleId}
            onChange={(event) => onRoleFilterChange(event.target.value)}
            className="px-4 py-2 border rounded-xl outline-none text-sm bg-white"
          >
            <option value="">Tat ca vai tro</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className="px-4 py-2 border rounded-xl outline-none text-sm bg-white"
          >
            <option value="">Tat ca trang thai</option>
            <option value="active">Hoat dong</option>
            <option value="locked">Bi khoa</option>
          </select>

          <button
            onClick={onOpenHistory}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-colors"
          >
            <History size={18} /> Lich su
          </button>

          <button
            onClick={onOpenCreate}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm"
          >
            <UserPlus size={18} /> Them moi
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold">Ma NV / Username</th>
              <th className="px-6 py-4 font-bold">Ho ten & Lien he</th>
              <th className="px-6 py-4 font-bold">Vai tro</th>
              <th className="px-6 py-4 font-bold text-center">Trang thai</th>
              <th className="px-6 py-4 font-bold text-right">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-400">
                  Dang tai...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 bg-slate-50/50">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="text-slate-300 mb-3" size={40} />
                    <p className="text-slate-600 font-bold text-lg">Khong tim thay tai khoan nao</p>
                    <p className="text-sm text-slate-400 mt-1">Thu lai voi tu khoa hoac bo loc khac.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-teal-600">{user.employee_id || '---'}</p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 uppercase">
                      {user.roles?.[0]?.name || 'Chua co vai tro'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {user.status === 'active' ? 'Hoat dong' : 'Bi khoa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onResetPassword(user)}
                      className="p-2 text-slate-400 hover:text-orange-600 bg-slate-50 rounded-lg"
                    >
                      <KeyRound size={16} />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user)}
                      className={`p-2 rounded-lg bg-slate-50 ${
                        user.status === 'active'
                          ? 'text-slate-400 hover:text-red-600'
                          : 'text-red-500 hover:text-emerald-600'
                      }`}
                    >
                      {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
        <span>Trang {currentPage} / {totalPages}</span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default UserManagementTable;
