import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, UserPlus, Edit, Lock, Unlock, KeyRound, X, ChevronLeft, ChevronRight
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // States Lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // States Modal Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: '', username: '', email: '', phone: '', password: '', role: 'bac_si', status: 'active', linked_profile_id: ''
  });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // Gọi API danh sách (Có phân trang)
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/users?page=${page}`, {
        params: { search: searchTerm, role: filterRole, status: filterStatus },
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

  // TÁCH THÀNH 2 USE-EFFECT ĐỂ CHỐNG KẸT API

  // 1. Lọc theo Vai trò / Trạng thái (Bấm chọn là gọi API ngay)
  useEffect(() => {
    fetchUsers(1);
  }, [filterRole, filterStatus]);

  // 2. Tìm kiếm bằng chữ (Debounce: Đợi gõ xong 0.5s mới tìm)
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchUsers(1);
    }, 500); 

    // Xóa bộ đếm giờ nếu người dùng vẫn đang tiếp tục gõ
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Khóa/Mở khóa
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

  // Đặt lại mật khẩu
  const handleResetPassword = async (user) => {
    if (!window.confirm(`Minh có chắc muốn đặt lại mật khẩu cho tài khoản ${user.username} không?`)) return;
    try {
      const res = await axios.post(`http://localhost:8000/api/users/${user.id}/reset-password`, {}, getAuthConfig());
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi đặt lại mật khẩu!');
    }
  };

  // Submit Thêm mới hoặc Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, name: '', username: '', email: '', phone: '', password: '', role: 'bac_si', status: 'active', linked_profile_id: '' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({ ...user, password: '' }); 
    setShowModal(true);
  };

  return (
    <div className="animate-in fade-in duration-500 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
      
      {/* TOOLBAR */}
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

          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2 border rounded-xl outline-none text-sm bg-white">
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="bac_si">Bác sĩ</option>
            <option value="le_tan">Lễ tân</option>
            <option value="ke_toan">Kế toán</option>
          </select>

          <button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
            <UserPlus size={18} /> Thêm mới
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
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
              <tr><td colSpan="5" className="text-center py-10 text-slate-400">Không tìm thấy tài khoản nào.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-teal-600">{user.employee_id}</p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email} • {user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 uppercase">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(user)} title="Sửa thông tin" className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => handleResetPassword(user)} title="Đặt lại mật khẩu" className="p-2 text-slate-400 hover:text-orange-600 bg-slate-50 hover:bg-orange-50 rounded-lg"><KeyRound size={16} /></button>
                    <button onClick={() => handleToggleStatus(user)} title={user.status === 'active' ? 'Khóa' : 'Mở khóa'} className={`p-2 rounded-lg bg-slate-50 ${user.status === 'active' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50'}`}>
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

      {/* FORM MODAL THÊM / SỬA */}
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
                  <label className="text-sm font-bold text-slate-700 block mb-1">Mật khẩu * (Hoa, thường, số, ký tự ĐB)</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500" />
                </div>
              )}

              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-bold text-slate-700 block mb-1">Vai trò *</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500">
                  <option value="admin">Quản trị viên</option>
                  <option value="bac_si">Bác sĩ</option>
                  <option value="le_tan">Lễ tân</option>
                  <option value="ke_toan">Kế toán</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-bold text-slate-700 block mb-1">Hồ sơ liên kết (Theo vai trò)</label>
                <select value={formData.linked_profile_id} onChange={e => setFormData({...formData, linked_profile_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-teal-500">
                  <option value="">-- Không có hồ sơ liên kết --</option>
                  <option value="1">BS. Nguyễn Văn A (Mẫu)</option>
                  <option value="2">LT. Trần Thị B (Mẫu)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">Sử dụng để liên kết tài khoản này với hồ sơ nhân sự/bác sĩ thực tế.</p>
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

    </div>
  );
};

export default UserManagement;