import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { sendResetOtp, verifyResetOtp, resetPassword } from '@/api/authApi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      await sendResetOtp(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const res = await verifyResetOtp(email, otp);
      setResetToken(res.data.reset_token);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ!');
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      setIsLoading(false);
      return;
    }
    try {
      await resetPassword(email, resetToken, password, confirmPassword);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.password?.[0] || 'Lỗi định dạng mật khẩu!');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-8 bg-teal-600 text-white text-center relative">
          <button onClick={() => navigate('/login')} className="absolute top-6 left-6 text-teal-100 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-md">
            {step === 4 ? <CheckCircle size={32} /> : <Lock size={32} />}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Khôi phục mật khẩu</h2>
          <p className="text-teal-100 text-sm mt-2">
            {step === 1 && 'Nhập email để nhận mã xác thực'}
            {step === 2 && 'Mã gồm 6 chữ số đã được gửi đi'}
            {step === 3 && 'Tạo mật khẩu bảo mật mới'}
            {step === 4 && 'Hoàn tất'}
          </p>
        </div>
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100 animate-in fade-in">
              <AlertCircle size={18} className="shrink-0" /><span>{error}</span>
            </div>
          )}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none" placeholder="Email của bạn" />
              </div>
              <button disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg">
                {isLoading ? 'Đang kiểm tra...' : 'Gửi mã xác nhận'}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4">
              <div className="text-center mb-6"><p className="text-sm font-bold text-slate-800">{email}</p></div>
              <input type="text" required maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none" placeholder="000000" />
              <button disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg">
                {isLoading ? 'Đang kiểm tra...' : 'Xác nhận mã'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={handleSendOtp} className="text-sm text-teal-600 font-bold hover:underline">Gửi lại mã</button>
              </div>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-in slide-in-from-right-4">
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Mật khẩu mới" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Xác nhận mật khẩu" />
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
              </div>
              <button disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg">
                {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          )}
          {step === 4 && (
            <div className="text-center space-y-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={40} /></div>
              <h3 className="text-xl font-bold text-slate-800">Đổi mật khẩu thành công!</h3>
              <p className="text-slate-500 text-sm">Vui lòng đăng nhập lại với mật khẩu mới của bạn.</p>
              <button onClick={() => navigate('/login')} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition-all">Quay về Đăng nhập</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
