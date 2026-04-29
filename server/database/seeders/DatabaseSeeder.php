<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call(PermissionSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(BranchSeeder::class);
        $this->call(StaffSeeder::class);
        $this->call(ServiceSeeder::class);
        $this->call(ProfessionalProfileSeeder::class);
        $this->call(WorkShiftTemplateSeeder::class);
    }
}
