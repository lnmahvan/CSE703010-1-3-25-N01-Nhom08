import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, Smartphone } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { login as loginApi, googleLogin as googleLoginApi, verifyLoginOtp } from '@/api/authApi';

const Login = () => {
  const [view, setView] = useState('login');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const response = await loginApi(email, password);
      if (response.data.requires_otp) {
        setTempUserId(response.data.user_id);
        setEmail(response.data.email);
        setView('otp');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Thông tin đăng nhập không chính xác!');
    } finally { setIsLoading(false); }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true); setError('');
      try {
        const response = await googleLoginApi(tokenResponse.access_token);
        if (response.data.requires_otp) {
          setTempUserId(response.data.user_id);
          setEmail(response.data.email);
          setView('otp');
        } else {
          login(response.data.token, response.data.user);
          navigate('/dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi đăng nhập bằng Google!');
      } finally { setIsLoading(false); }
    },
    onError: () => setError('Cửa sổ Google đã đóng hoặc có lỗi!'),
  });

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const response = await verifyLoginOtp(tempUserId, otp);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác minh không đúng!');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 transition-all">
        {/* Header */}
        <div className="p-10 bg-teal-600 text-white text-center relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          {view === 'otp' && (
            <button onClick={() => { setView('login'); setOtp(''); }} className="absolute top-6 left-6 text-teal-100 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="w-20 h-20 bg-white/20 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
            {view === 'login' ? <ShieldCheck size={40} /> : <Smartphone size={40} />}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {view === 'login' ? 'Dental Pro' : 'Xác minh OTP'}
          </h2>
          <p className="text-teal-100 text-sm mt-2 opacity-90">
            {view === 'login' ? 'Hệ thống quản lý nội bộ' : 'Mã đã được gửi về Gmail của bạn'}
          </p>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {view === 'login' && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email nhân sự</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none"
                    placeholder="admin@dental.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-teal-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <button type="button" onClick={() => navigate('/forgot-password')}
                    className="text-sm text-teal-600 font-medium hover:text-teal-700 hover:underline transition-colors">
                    Quên mật khẩu?
                  </button>
                </div>
              </div>
              <button disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-4 text-lg">
                {isLoading ? 'Đang kiểm tra...' : 'Tiếp tục'}
              </button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-500 font-medium">Hoặc tiếp tục với</span></div>
              </div>
              <button type="button" onClick={() => loginWithGoogle()} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-2xl shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Đăng nhập bằng Google
              </button>
            </form>
          )}

          {view === 'otp' && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="text-center">
                <p className="text-sm text-slate-500">Chúng tôi đã gửi mã xác minh đến:</p>
                <p className="text-sm font-bold text-slate-800">{email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 text-center block">Mã xác minh (6 số)</label>
                <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6"
                  className="w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none"
                  placeholder="000000" />
              </div>
              <button disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] text-lg">
                {isLoading ? 'Đang xác thực...' : 'Xác nhận đăng nhập'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
