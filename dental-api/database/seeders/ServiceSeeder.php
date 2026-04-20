<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void {
    \App\Models\Service::insert([
        ['name' => 'Lấy cao răng', 'price' => 200000, 'commission_rate' => 10],
        ['name' => 'Nhổ răng khôn', 'price' => 1500000, 'commission_rate' => 15],
        ['name' => 'Tẩy trắng răng', 'price' => 2500000, 'commission_rate' => 20],
    ]);
}
}
