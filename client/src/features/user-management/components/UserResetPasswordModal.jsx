import React from 'react';
import { KeyRound, X } from 'lucide-react';

const UserResetPasswordModal = ({
  resetModal,
  resetForm,
  onClose,
  onChange,
  onSendOtp,
  onContinue,
  onBack,
  onSubmit,
}) => {
  if (!resetModal.show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <KeyRound className="text-orange-500" /> Doi mat khau
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {resetModal.step === 1 && (
          <div className="text-center animate-in slide-in-from-right-4">
            <p className="text-slate-600 mb-6">
              Yeu cau dat lai mat khau cho tai khoan <strong>@{resetModal.user?.username}</strong>.
              He thong se gui OTP den email cua tai khoan nay de xac thuc.
            </p>
            <button
              onClick={onSendOtp}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Gui ma OTP ngay
            </button>
          </div>
        )}

        {resetModal.step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Nhap ma OTP (6 so)</label>
              <input
                required
                type="text"
                maxLength="6"
                value={resetForm.otp}
                onChange={(event) => onChange('otp', event.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-orange-500 text-center font-bold tracking-widest text-2xl"
                placeholder="------"
              />
              <p className="text-xs text-slate-400 mt-2 text-center">Kiem tra hop thu email de lay OTP.</p>
            </div>
            <button
              onClick={onContinue}
              className="w-full bg-slate-900 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-4"
            >
              Tiep tuc
            </button>
          </div>
        )}

        {resetModal.step === 3 && (
          <form onSubmit={onSubmit} className="space-y-4 animate-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Mat khau moi</label>
              <input
                required
                type="text"
                minLength="8"
                value={resetForm.newPassword}
                onChange={(event) => onChange('newPassword', event.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-orange-500"
                placeholder="Nhap mat khau moi..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-4"
            >
              Xac nhan doi mat khau
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition-colors mt-2 text-sm"
            >
              Quay lai sua ma OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserResetPasswordModal;
