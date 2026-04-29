<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $branches = Branch::pluck('id', 'code');

        $rows = [
            [
                'employee_code' => 'AD001',
                'full_name' => 'Quan tri vien',
                'email' => 'admin@dental.com',
                'phone' => '0900000001',
                'role_slug' => 'admin',
                'join_date' => '2024-01-10',
                'status' => 'working',
                'branch_code' => 'PK1-HN',
            ],
            [
                'employee_code' => 'BS001',
                'full_name' => 'Bac si Nguyen A',
                'email' => 'bacsi@dental.com',
                'phone' => '0900000002',
                'role_slug' => 'bac_si',
                'join_date' => '2024-02-15',
                'status' => 'working',
                'branch_code' => 'PK1-HN',
            ],
            [
                'employee_code' => 'LT001',
                'full_name' => 'Le tan Tran B',
                'email' => 'letan@dental.com',
                'phone' => '0900000003',
                'role_slug' => 'le_tan',
                'join_date' => '2024-03-01',
                'status' => 'working',
                'branch_code' => 'PK1-HN',
            ],
            [
                'employee_code' => 'KT001',
                'full_name' => 'Ke toan Le C',
                'email' => 'ketoan@dental.com',
                'phone' => '0900000004',
                'role_slug' => 'ke_toan',
                'join_date' => '2024-03-20',
                'status' => 'working',
                'branch_code' => 'PK2-HCM',
            ],
            [
                'employee_code' => 'LT002',
                'full_name' => 'Le tan bi khoa',
                'email' => 'locked@dental.com',
                'phone' => '0900000005',
                'role_slug' => 'le_tan',
                'join_date' => '2024-04-05',
                'status' => 'suspended',
                'branch_code' => 'PK3-DN',
            ],
        ];

        foreach ($rows as $row) {
            $user = User::where('email', $row['email'])->first();
            $branchId = $branches[$row['branch_code']] ?? null;
            unset($row['branch_code']);

            Staff::updateOrCreate(
                ['employee_code' => $row['employee_code']],
                array_merge($row, [
                    'user_id' => $user?->id,
                    'branch_id' => $branchId,
                ])
            );
        }
    }
}
