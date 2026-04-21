import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, UserPlus, Edit, Lock, Unlock, KeyRound, X, ChevronLeft, ChevronRight, History
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]); // THÊM: Chứa danh sách vai trò
  const [loading, setLoading] = useState(true);
  
  // States cho Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // States cho Lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoleId, setFilterRoleId] = useState(''); // THAY ĐỔI: Thành role_id
  const [filterStatus, setFilterStatus] = useState('');

  // States cho Modal Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: '', username: '', email: '', phone: '', password: '', role_id: '', status: 'active', linked_profile_id: ''
  });

  // States cho Modal Lịch sử (Dữ liệu thật)
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);

  // States cho Modal Reset Mật Khẩu (Luồng 3 Bước)
  const [resetModal, setResetModal] = useState({ show: false, user: null, step: 1 });
  const [resetForm, setResetForm] = useState({ otp: '', newPassword: '' });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // --- HÀM GỌI API ---

  // Lấy danh sách Vai trò
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/roles', getAuthConfig());
        setAvailableRoles(res.data);
      } catch (error) {
        console.error("Lỗi lấy roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Lấy danh sách tài khoản
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/users?page=${page}`, {
        params: { search: searchTerm, role_id: filterRoleId, status: filterStatus },
        ...getAuthConfig()
      });
      setUsers(response.data.data); 
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy lịch sử thay đổi từ Database
  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/users/history', getAuthConfig());
      setHistoryLogs(res.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
    }
  };

  // --- EFFECT XỬ LÝ TÌM KIẾM & LỌC ---

  useEffect(() => {
    fetchUsers(1);
  }, [filterRoleId, filterStatus]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchUsers(1);
    }, 500); 
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // --- XỬ LÝ THAO TÁC TÀI KHOẢN ---

  const handleToggleStatus = async (user) => {
    if (!window.confirm(`Xác nhận ${user.status === 'active' ? 'khóa' : 'mở khóa'} tài khoản ${user.username}?`)) return;
    try {
      const res = await axios.put(`http://localhost:8000/api/users/${user.id}/toggle-status`, {}, getAuthConfig());
      alert(res.data.message);
      fetchUsers(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role_id) return alert("Vui lòng chọn vai trò!");
    try {
      if (isEditing) {
        await axios.put(`http://localhost:8000/api/users/${formData.id}`, formData, getAuthConfig());
        alert('Cập nhật thành công!');
      } else {
        await axios.post('http://localhost:8000/api/users', formData, getAuthConfig());
        alert('Tạo tài khoản mới thành công!');
      }
      setShowModal(false);
      fetchUsers(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi lưu dữ liệu!');
    }
  };

  // --- XỬ LÝ ĐẶT LẠI MẬT KHẨU (3 BƯỚC) ---

  const openResetModal = (user) => {
    setResetModal({ show: true, user: user, step: 1 });
    setResetForm({ otp: '', newPassword: '' });
  };

  const handleSendOtp = async () => {
    try {
      await axios.post(`http://localhost:8000/api/users/${resetModal.user.id}/send-reset-otp`, {}, getAuthConfig());
      alert('Đã gửi mã OTP về email thành công!');
      setResetModal({ ...resetModal, step: 2 });
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi gửi OTP!');
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:8000/api/users/${resetModal.user.id}/verify-reset`, {
        otp: resetForm.otp,
        new_password: resetForm.newPassword
      }, getAuthConfig());
      alert(res.data.message);
      setResetModal({ show: false, user: null, step: 1 });
    } catch (error) {
      alert(error.response?.data?.message || 'Mã OTP không đúng hoặc lỗi!');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
      
      {/* THANH CÔNG CỤ (HEADER) */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
        <h3 className="text-xl font-bold text-slate-800">Quản lý Tài khoản</h3>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Tìm tên, username, mã..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
          </div>

          <select value={filterRoleId} onChange={(e) => setFilterRoleId(e.target.value)} className="px-4 py-2 border rounded-xl outline-none text-sm bg-white">
            <option value="">Tất cả vai trò</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>

          <button onClick={() => { fetchHistory(); setShowHistoryModal(true); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-colors">
            <History size={18} /> Lịch sử
          </button>

          <button onClick={() => { setIsEditing(false); setFormData({ id: null, name: '', username: '', email: '', phone: '', password: '', role_id: '', status: 'active', linked_profile_id: '' }); setShowModal(true); }} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
            <UserPlus size={18} /> Thêm mới
          </button>
        </div>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold">Mã NV / Username</th>
              <th className="px-6 py-4 font-bold">Họ tên & Liên hệ</th>
              <th className="px-6 py-4 font-bold">Vai trò</th>
              <th className="px-6 py-4 font-bold text-center">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-slate-400">Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 bg-slate-50/50">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="text-slate-300 mb-3" size={40} />
                    <p className="text-slate-600 font-bold text-lg">Không tìm thấy tài khoản nào</p>
                    <p className="text-sm text-slate-400 mt-1">Vui lòng thử lại với từ khóa hoặc bộ lọc khác nha!</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map(user => (
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
                      {user.roles && user.roles.length > 0 ? user.roles[0].name : 'Chưa có vai trò'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setIsEditing(true); setFormData({...user, password: '', role_id: user.roles && user.roles.length > 0 ? user.roles[0].id : ''}); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => openResetModal(user)} className="p-2 text-slate-400 hover:text-orange-600 bg-slate-50 rounded-lg"><KeyRound size={16} /></button>
                    <button onClick={() => handleToggleStatus(user)} className={`p-2 rounded-lg bg-slate-50 ${user.status === 'active' ? 'text-slate-400 hover:text-red-600' : 'text-red-500 hover:text-emerald-600'}`}>
                      {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
        <span>Trang {currentPage} / {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => fetchUsers(currentPage - 1)} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronLeft size={18}/></button>
          <button disabled={currentPage === totalPages} onClick={() => fetchUsers(currentPage + 1)} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronRight size={18}/></button>
        </div>
      </div>

      {/* MODAL RESET MẬT KHẨU (3 BƯỚC) */}
      {resetModal.show && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <KeyRound className="text-orange-500" /> Đổi mật khẩu
              </h3>
              <button onClick={() => setResetModal({ show: false, user: null, step: 1 })} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            {resetModal.step === 1 && (
              <div className="text-center animate-in slide-in-from-right-4">
                <p className="text-slate-600 mb-6">Bạn đang yêu cầu đặt lại mật khẩu cho tài khoản <strong className="text-slate-800">@{resetModal.user?.username}</strong>. Hệ thống sẽ gửi một mã OTP về email của tài khoản này để xác thực.</p>
                <button onClick={handleSendOtp} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors">Gửi mã OTP ngay</button>
              </div>
            )}

            {resetModal.step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">Nhập mã OTP (6 số)</label>
                  <input required type="text" maxLength="6" value={resetForm.otp} onChange={e => setResetForm({...resetForm, otp: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-orange-500 text-center font-bold tracking-widest text-2xl" placeholder="------" />
                  <p className="text-xs text-slate-400 mt-2 text-center">Mã OTP đã được gửi đến email. Vui lòng kiểm tra hộp thư.</p>
                </div>
                <button onClick={() => resetForm.otp.length === 6 ? setResetModal({...resetModal, step: 3}) : alert('Nhập đủ 6 số nha!')} className="w-full bg-slate-900 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-4">Tiếp tục</button>
              </div>
            )}

            {resetModal.step === 3 && (
              <form onSubmit={handleVerifyAndReset} className="space-y-4 animate-in slide-in-from-right-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">Mật khẩu mới tự đặt</label>
                  <input required type="text" minLength="8" value={resetForm.newPassword} onChange={e => setResetForm({...resetForm, newPassword: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-orange-500" placeholder="Nhập mật khẩu mới..." />
                  <p className="text-xs text-slate-400 mt-1">Lưu ý: Mật khẩu mới cần tối thiểu 8 ký tự.</p>
                </div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-4">Xác nhận đổi mật khẩu</button>
                <button type="button" onClick={() => setResetModal({...resetModal, step: 2})} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition-colors mt-2 text-sm">Quay lại sửa mã OTP</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA TÀI KHOẢN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-bold text-slate-700 block mb-1">Họ và tên *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-bold text-slate-700 block mb-1">Username *</label>
                <input required disabled={isEditing} type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500 disabled:opacity-50" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-bold text-slate-700 block mb-1">Email *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-bold text-slate-700 block mb-1">Số điện thoại</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500" />
              </div>
              
              {!isEditing && (
                <div className="col-span-2 md:col-span-1">
                  <label className="text-sm font-bold text-slate-700 block mb-1">Mật khẩu *</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500" />
                </div>
              )}

              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-bold text-slate-700 block mb-1">Vai trò *</label>
                <select required value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500">
                  <option value="">-- Chọn vai trò --</option>
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-bold text-slate-700 block mb-1">Hồ sơ liên kết (Theo vai trò)</label>
                <select value={formData.linked_profile_id} onChange={e => setFormData({...formData, linked_profile_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500">
                  <option value="">-- Không có hồ sơ liên kết --</option>
                  <option value="1">BS. Nguyễn Văn A (Mẫu)</option>
                  <option value="2">LT. Trần Thị B (Mẫu)</option>
                </select>
              </div>

              <div className="col-span-2 mt-4">
                <button type="submit" className="w-full bg-slate-900 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl transition-colors">
                  {isEditing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LỊCH SỬ */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <History className="text-teal-600" /> Lịch sử thay đổi hệ thống
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-bold border-b border-slate-100">Thời gian</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-100">Người thực hiện</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-100">Hành động</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-100">Nội dung thay đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-500">Chưa có lịch sử thay đổi nào trong hệ thống.</td>
                    </tr>
                  ) : (
                    historyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{log.admin_name}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 text-right">
              <button onClick={() => setShowHistoryModal(false)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;