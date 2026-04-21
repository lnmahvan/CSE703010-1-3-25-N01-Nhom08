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

        // Xóa cột role (Enum) cũ trong bảng users
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
