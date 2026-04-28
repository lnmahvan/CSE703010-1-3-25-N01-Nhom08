import React, { useState, useEffect } from 'react';
import { Shield, Save, Search, Users, UserCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import permissionApi from '@/api/permissionApi';
import * as userApi from '@/api/userApi';
import { useAuth } from '@/hooks/useAuth';

const PermissionManagement = () => {
  const { toast } = useToast();
  const { userRole } = useAuth();
  
  const [permissionsMap, setPermissionsMap] = useState({});
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [activeTab, setActiveTab] = useState('role'); // 'role' or 'user'
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [currentPermissionIds, setCurrentPermissionIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch dữ liệu cơ bản
  useEffect(() => {
    let ignore = false;

    const fetchBaseData = async () => {
      try {
        const [permRes, rolesRes, usersRes] = await Promise.all([
          permissionApi.getAllPermissions(),
          userApi.getAllRoles(),
          userApi.getUsers({ page: 1, limit: 100 }) 
        ]);
        if (!ignore) {
          setPermissionsMap(permRes.data || {});
          setRoles(rolesRes.data || []);
          setUsers(usersRes.data?.data || []);
        }
      } catch {
        if (!ignore) {
          toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải dữ liệu phân quyền' });
        }
      }
    };

    if (userRole === 'admin') {
      void fetchBaseData();
    }

    return () => { ignore = true; };
  }, [userRole, toast]);

  // Lấy quyền khi chọn Role
  useEffect(() => {
    let ignore = false;

    const fetchRolePermissions = async (roleId) => {
      try {
        const res = await permissionApi.getRolePermissions(roleId);
        if (!ignore) {
          setCurrentPermissionIds(res.data?.permission_ids || []);
        }
      } catch {
        if (!ignore) {
          toast({ variant: 'destructive', title: 'Lỗi', description: 'Lỗi khi tải quyền vai trò' });
        }
      }
    };

    if (activeTab === 'role' && selectedRole) {
      void fetchRolePermissions(selectedRole);
    }

    return () => { ignore = true; };
  }, [selectedRole, activeTab, toast]);

  // Lấy quyền khi chọn User
  useEffect(() => {
    let ignore = false;

    const fetchUserPermissions = async (userId) => {
      try {
        const res = await permissionApi.getUserPermissions(userId);
        if (!ignore) {
          setCurrentPermissionIds(res.data?.permission_ids || []);
        }
      } catch {
        if (!ignore) {
          toast({ variant: 'destructive', title: 'Lỗi', description: 'Lỗi khi tải quyền tài khoản' });
        }
      }
    };

    if (activeTab === 'user' && selectedUser) {
      void fetchUserPermissions(selectedUser);
    }

    return () => { ignore = true; };
  }, [selectedUser, activeTab, toast]);

  // Handlers
  const handleTogglePermission = (permissionId) => {
    setCurrentPermissionIds(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleModuleAll = (modulePermissions, isAllChecked) => {
    const moduleIds = modulePermissions.map(p => p.id);
    if (isAllChecked) {
      setCurrentPermissionIds(prev => prev.filter(id => !moduleIds.includes(id)));
    } else {
      setCurrentPermissionIds(prev => {
        const newSet = new Set([...prev, ...moduleIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleSave = async () => {
    if (activeTab === 'role' && !selectedRole) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng chọn vai trò' });
      return;
    }
    if (activeTab === 'user' && !selectedUser) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng chọn tài khoản' });
      return;
    }

    setIsSaving(true);
    try {
      if (activeTab === 'role') {
        await permissionApi.updateRolePermissions(selectedRole, currentPermissionIds);
        toast({ title: 'Thành công', description: 'Cập nhật quyền vai trò thành công' });
      } else {
        await permissionApi.updateUserPermissions(selectedUser, currentPermissionIds);
        toast({ title: 'Thành công', description: 'Cập nhật quyền tài khoản thành công (đã ghi đè quyền vai trò)' });
      }
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: 'Lỗi', 
        description: err.response?.data?.message || 'Có lỗi xảy ra khi lưu quyền' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (userRole !== 'admin') {
    return <div className="p-8 text-center font-medium">Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="h-6 w-6 text-teal-600" />
            Phân quyền người dùng
          </h1>
          <p className="text-gray-500 mt-1">Cấu hình quyền truy cập cho vai trò hoặc từng tài khoản</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || (activeTab === 'role' ? !selectedRole : !selectedUser)} className="bg-teal-600 hover:bg-teal-700 transition-colors">
          <Save className="h-4 w-4 mr-2" />
          Lưu thay đổi
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="role" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all">
                <Users className="h-4 w-4" /> Vai trò mặc định
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all">
                <UserCircle className="h-4 w-4" /> Tài khoản riêng
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <div className="w-full sm:w-72">
                {activeTab === 'role' ? (
                  <Select value={selectedRole || ''} onValueChange={setSelectedRole}>
                    <SelectTrigger className="bg-white border-slate-200 hover:border-teal-400 focus:ring-teal-500/20 transition-all rounded-lg h-11">
                      <SelectValue placeholder="-- Chọn vai trò --" />
                    </SelectTrigger>
                    {/* Bảng dropdown được set màu trắng đục, shadow lớn và z-index cao để nổi bật */}
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-[100] rounded-lg">
                      {roles.map(r => (
                        <SelectItem key={r.id} value={r.id.toString()} className="cursor-pointer hover:bg-teal-50 focus:bg-teal-50 focus:text-teal-900 transition-colors py-2.5">
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                    <SelectTrigger className="bg-white border-slate-200 hover:border-teal-400 focus:ring-teal-500/20 transition-all rounded-lg h-11">
                      <SelectValue placeholder="-- Chọn tài khoản --" />
                    </SelectTrigger>
                    {/* Bảng dropdown được set màu trắng đục, shadow lớn và z-index cao để nổi bật */}
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-[100] rounded-lg">
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()} className="cursor-pointer hover:bg-teal-50 focus:bg-teal-50 focus:text-teal-900 transition-colors py-2.5">
                          {u.name} <span className="text-slate-400 text-xs ml-1">({u.username})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="flex-1 w-full relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Tìm kiếm quyền theo tên..." 
                  className="pl-10 h-11 rounded-lg border-slate-200 hover:border-teal-400 focus-visible:ring-teal-500/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Bảng phân quyền */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-700 w-1/4">Nhóm chức năng</th>
                    <th className="px-4 py-4 font-semibold text-slate-700 w-24 text-center border-l border-r border-slate-200">Tất cả</th>
                    <th className="px-5 py-4 font-semibold text-slate-700">Chi tiết quyền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(permissionsMap).map(([moduleSlug, perms]) => {
                    const filteredPerms = perms.filter(p => 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.module.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filteredPerms.length === 0) return null;

                    const isAllChecked = filteredPerms.every(p => currentPermissionIds.includes(p.id));
                    const isSomeChecked = filteredPerms.some(p => currentPermissionIds.includes(p.id)) && !isAllChecked;
                    const moduleNameMatch = filteredPerms[0].name.split(' ').slice(1).join(' ');

                    return (
                      <tr 
                        key={moduleSlug} 
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-5 align-top font-medium text-slate-800 capitalize">
                          {moduleNameMatch} 
                          <span className="text-[11px] text-slate-400 font-normal block mt-1 uppercase tracking-wider">{moduleSlug}</span>
                        </td>
                        <td className="px-4 py-5 align-top text-center border-l border-r border-slate-100">
                          <div 
                            className="cursor-pointer inline-flex items-center justify-center p-2 rounded hover:bg-slate-100 transition-colors"
                            onClick={() => handleToggleModuleAll(filteredPerms, isAllChecked)}
                          >
                            <Checkbox 
                              checked={isAllChecked} 
                              className={`w-5 h-5 rounded pointer-events-none ${isSomeChecked ? "opacity-50" : ""}`}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredPerms.map(p => {
                              const isChecked = currentPermissionIds.includes(p.id);
                              return (
                                // Sử dụng div bọc ngoài để bắt sự kiện click duy nhất
                                // Checkbox có pointer-events-none để tránh click đúp (nếu Checkbox bị click trực tiếp)
                                <div 
                                  key={p.id} 
                                  onClick={() => handleTogglePermission(p.id)}
                                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 cursor-pointer border select-none 
                                    ${isChecked 
                                      ? 'bg-teal-50/80 border-teal-200 shadow-sm' 
                                      : 'border-transparent hover:border-teal-100 hover:bg-slate-50'
                                    }`}
                                >
                                  <Checkbox 
                                    id={`perm-${p.id}`} 
                                    checked={isChecked}
                                    className="w-4 h-4 rounded-sm data-[state=checked]:bg-teal-600 data-[state=checked]:text-white pointer-events-none"
                                  />
                                  <span className={`text-sm font-medium flex-1 ${isChecked ? 'text-teal-900' : 'text-slate-600'}`}>
                                    {p.name.split(' ')[0]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {Object.keys(permissionsMap).length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-12 text-center text-slate-500">
                        Đang tải danh sách quyền...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {activeTab === 'user' && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-start gap-3">
                <Shield className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block mb-1 text-amber-900">Lưu ý khi phân quyền Tài khoản riêng:</strong> 
                  Việc lưu cấu hình cho Tài khoản riêng sẽ <strong>Ghi đè hoàn toàn</strong> quyền từ Vai trò mặc định. 
                  Nếu bạn bỏ chọn tất cả, tài khoản sẽ bị tước mọi quyền (bao gồm cả các quyền sẵn có từ vai trò hiện tại).
                </div>
              </div>
            )}
            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManagement;
