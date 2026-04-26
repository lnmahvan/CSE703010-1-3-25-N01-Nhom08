<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed vai trò trước (bắt buộc, phải có trước khi tạo user)
        $this->call(RoleSeeder::class);

        // 2. Seed quyền (phụ thuộc vào Role)
        $this->call(PermissionSeeder::class);

        // 3. Seed tài khoản nhân sự mẫu
        $this->call(UserSeeder::class);
    }
}
