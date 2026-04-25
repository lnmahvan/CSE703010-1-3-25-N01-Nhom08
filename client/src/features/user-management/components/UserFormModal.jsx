import React from 'react';
import { X } from 'lucide-react';

const UserFormModal = ({
  open,
  isEditing,
  formData,
  availableRoles,
  onClose,
  onChange,
  onSubmit,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            {isEditing ? 'Sua Tai Khoan' : 'Them Tai Khoan Moi'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-slate-700 block mb-1">Ho va ten *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(event) => onChange('name', event.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-slate-700 block mb-1">Username *</label>
            <input
              required
              disabled={isEditing}
              type="text"
              value={formData.username}
              onChange={(event) => onChange('username', event.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500 disabled:opacity-50"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-slate-700 block mb-1">Email *</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(event) => onChange('email', event.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-slate-700 block mb-1">So dien thoai</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(event) => onChange('phone', event.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500"
            />
          </div>

          {!isEditing && (
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-700 block mb-1">Mat khau *</label>
              <input
                required
                type="text"
                value={formData.password}
                onChange={(event) => onChange('password', event.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500"
              />
            </div>
          )}

          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-slate-700 block mb-1">Vai tro *</label>
            <select
              required
              value={formData.role_id}
              onChange={(event) => onChange('role_id', event.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500"
            >
              <option value="">-- Chon vai tro --</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-sm font-bold text-slate-700 block mb-1">Ho so lien ket</label>
            <select
              value={formData.linked_profile_id}
              onChange={(event) => onChange('linked_profile_id', event.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500"
            >
              <option value="">-- Khong co ho so lien ket --</option>
              <option value="1">BS. Nguyen Van A (Mau)</option>
              <option value="2">LT. Tran Thi B (Mau)</option>
            </select>
          </div>

          <div className="col-span-2 mt-4">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {isEditing ? 'Luu thay doi' : 'Tao tai khoan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
