<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'users' => 'Quản lý người dùng',
            'staff' => 'Nhân sự',
            'categories' => 'Danh mục',
            'patients' => 'Bệnh nhân',
            'appointments' => 'Lịch hẹn',
            'dental_records' => 'Khám nha khoa',
            'finance' => 'Tài chính',
            'reports' => 'Báo cáo'
        ];

        $actions = [
            'view' => 'Xem',
            'create' => 'Thêm',
            'edit' => 'Sửa',
            'delete' => 'Xóa',
            'approve' => 'Duyệt/Xác nhận',
            'export' => 'In/Xuất file'
        ];

        $permissionIds = [];

        // Tạo tất cả các quyền
        foreach ($modules as $moduleSlug => $moduleName) {
            foreach ($actions as $actionSlug => $actionName) {
                $permission = Permission::firstOrCreate(
                    ['slug' => "{$moduleSlug}.{$actionSlug}"],
                    [
                        'name' => "{$actionName} {$moduleName}",
                        'module' => $moduleSlug
                    ]
                );
                $permissionIds[] = $permission->id;
            }
        }

        // Cấp FULL quyền cho vai trò admin
        $adminRole = Role::where('slug', 'admin')->first();
        if ($adminRole) {
            $adminRole->permissions()->sync($permissionIds);
        }
    }
}
