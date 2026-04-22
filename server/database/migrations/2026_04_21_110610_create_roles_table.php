<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tạo bảng Vai trò
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Hiển thị: Quản trị viên, Bác sĩ...
            $table->string('slug')->unique(); // Code: admin, bac_si...
            $table->timestamps();
        });

        // Tạo bảng trung gian nối User và Role
        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Cột role enum cũ đã được loại bỏ trực tiếp trong migration create_users_table
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
