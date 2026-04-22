<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Quản trị viên', 'slug' => 'admin'],
            ['name' => 'Bác sĩ',        'slug' => 'bac_si'],
            ['name' => 'Lễ tân',         'slug' => 'le_tan'],
            ['name' => 'Kế toán',        'slug' => 'ke_toan'],
            ['name' => 'Bệnh nhân',      'slug' => 'benh_nhan'],
        ];

        foreach ($roles as $role) {
            // firstOrCreate để chạy nhiều lần không bị lỗi duplicate
            DB::table('roles')->insertOrIgnore([
                ...$role,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
