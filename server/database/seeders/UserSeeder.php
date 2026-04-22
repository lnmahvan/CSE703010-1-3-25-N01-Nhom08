<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['admin', 'bac_si', 'le_tan', 'ke_toan'];
        
        foreach ($roles as $role) {
            User::create([
                'name' => "Tài khoản " . strtoupper($role),
                'email' => "$role@dental.com",
                'password' => Hash::make('123456'), // Pass chung cho dễ test
                'role' => $role,
                'status' => 'active'
            ]);
        }

        // Tạo thêm 1 tài khoản bị khóa để test (Test case 6)
        User::create([
            'name' => 'Lễ tân bị khóa',
            'email' => 'locked@dental.com',
            'password' => Hash::make('123456'),
            'role' => 'le_tan',
            'status' => 'inactive'
        ]);
    }
}