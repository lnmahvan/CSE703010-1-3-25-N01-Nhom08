<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'users' => 'Quan ly nguoi dung',
            'staff' => 'Nhan su',
            'professional_profiles' => 'Ho so chuyen mon',
            'categories' => 'Danh muc',
            'patients' => 'Benh nhan',
            'appointments' => 'Lich hen',
            'dental_records' => 'Kham nha khoa',
            'finance' => 'Tai chinh',
            'reports' => 'Bao cao',
            'schedules' => 'Lich lam viec',
            'services' => 'Dich vu nha khoa',
        ];

        $actions = [
            'view' => 'Xem',
            'create' => 'Them',
            'edit' => 'Sua',
            'delete' => 'Xoa',
            'approve' => 'Duyet/Xac nhan',
            'export' => 'In/Xuat file',
        ];

        $permissionIds = [];

        foreach ($modules as $moduleSlug => $moduleName) {
            foreach ($actions as $actionSlug => $actionName) {
                $permission = Permission::firstOrCreate(
                    ['slug' => "{$moduleSlug}.{$actionSlug}"],
                    [
                        'name' => "{$actionName} {$moduleName}",
                        'module' => $moduleSlug,
                    ]
                );
                $permissionIds[] = $permission->id;
            }
        }

        // Admin nhan toan bo quyen
        $adminRole = Role::where('slug', 'admin')->first();
        if ($adminRole) {
            $adminRole->permissions()->sync($permissionIds);
        }

        // Non-admin roles nhan quyen mac dinh services.view
        $defaultServicePermissions = Permission::where('slug', 'services.view')->pluck('id')->toArray();
        $nonAdminRoles = Role::where('slug', '!=', 'admin')->get();
        foreach ($nonAdminRoles as $role) {
            $role->permissions()->syncWithoutDetaching($defaultServicePermissions);
        }
    }
}
