<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['slug' => 'admin',   'name' => 'Quản trị viên',   'email' => 'admin@dental.com',   'username' => 'admin',    'employee_id' => 'AD001'],
            ['slug' => 'bac_si',  'name' => 'Bác sĩ Nguyễn A', 'email' => 'bacsi@dental.com',   'username' => 'bacsi_a',  'employee_id' => 'BS001'],
            ['slug' => 'le_tan',  'name' => 'Lễ tân Trần B',   'email' => 'letan@dental.com',   'username' => 'letan_b',  'employee_id' => 'LT001'],
            ['slug' => 'ke_toan', 'name' => 'Kế toán Lê C',    'email' => 'ketoan@dental.com',  'username' => 'ketoan_c', 'employee_id' => 'KT001'],
        ];
        
        foreach ($accounts as $acc) {
            $role = Role::where('slug', $acc['slug'])->first();
            
            $user = User::create([
                'name'        => $acc['name'],
                'username'    => $acc['username'],
                'email'       => $acc['email'],
                'employee_id' => $acc['employee_id'],
                'password'    => Hash::make('Dental@123'),
                'status'      => 'active',
            ]);

            // Gắn vai trò qua bảng pivot
            if ($role) {
                $user->roles()->attach($role->id);
            }
        }

        // Tạo thêm 1 tài khoản bị khóa để test (Test case 6)
        $role = Role::where('slug', 'le_tan')->first();
        $locked = User::create([
            'name'        => 'Lễ tân bị khóa',
            'username'    => 'letan_locked',
            'email'       => 'locked@dental.com',
            'employee_id' => 'LT002',
            'password'    => Hash::make('Dental@123'),
            'status'      => 'locked',
        ]);
        if ($role) {
            $locked->roles()->attach($role->id);
        }
    }
}