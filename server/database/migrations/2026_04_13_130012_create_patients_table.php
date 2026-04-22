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
    Schema::create('patients', function (Blueprint $table) {
        $table->id();
        $table->string('patient_code')->unique(); // Mã BN kiểu BN-2026-001
        $table->string('full_name');
        $table->string('phone')->unique();
        $table->date('dob')->nullable(); // Ngày sinh
        $table->enum('gender', ['Nam', 'Nữ', 'Khác'])->default('Khác');
        $table->text('address')->nullable();
        $table->text('medical_history')->nullable(); // Tiền sử bệnh lý
        $table->integer('loyalty_points')->default(0); // Điểm tích lũy
        $table->decimal('total_debt', 15, 2)->default(0); // Tổng nợ
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
