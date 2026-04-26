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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code')->unique(); // Mã nhân viên (e.g., NV001)
            $table->string('full_name');
            $table->string('phone')->nullable()->unique();
            $table->string('email')->unique();
            $table->string('avatar')->nullable();
            $table->date('join_date')->nullable();
            $table->enum('status', ['working', 'suspended', 'resigned'])->default('working'); // Đang làm việc, Tạm nghỉ, Nghỉ việc
            $table->string('role_slug'); // 'admin', 'bac_si', 'le_tan', etc.
            
            // Dành cho Bác sĩ
            $table->string('certificate_file')->nullable(); 
            $table->boolean('is_certificate_valid')->default(false); 
            
            // Tài khoản liên kết
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
