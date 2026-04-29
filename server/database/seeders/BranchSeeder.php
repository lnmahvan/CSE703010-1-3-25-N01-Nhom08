<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'code' => 'PK1-HN',
                'name' => 'Phòng Khám 1 - Hà Nội',
                'address' => '123 Hai Bà Trưng, Hoàn Kiếm',
                'city' => 'Hà Nội',
                'phone' => '0243-1234-567',
                'status' => 'active',
            ],
            [
                'code' => 'PK2-HCM',
                'name' => 'Phòng Khám 2 - Hồ Chí Minh',
                'address' => '456 Lê Lợi, Quận 1',
                'city' => 'Hồ Chí Minh',
                'phone' => '0283-1234-567',
                'status' => 'active',
            ],
            [
                'code' => 'PK3-DN',
                'name' => 'Phòng Khám 3 - Đà Nẵng',
                'address' => '78 Bạch Đằng, Hải Châu',
                'city' => 'Đà Nẵng',
                'phone' => '0236-1234-567',
                'status' => 'active',
            ],
        ];

        foreach ($rows as $row) {
            Branch::updateOrCreate(['code' => $row['code']], $row);
        }
    }
}
