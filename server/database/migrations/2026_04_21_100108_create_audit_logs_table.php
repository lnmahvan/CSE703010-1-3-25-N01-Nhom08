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
    Schema::create('audit_logs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('admin_id'); // ID của Admin thực hiện
        $table->string('admin_name');           // Tên Admin (để hiển thị cho nhanh)
        $table->string('action');               // Hành động (Tạo, Sửa, Khóa...)
        $table->text('details');                // Chi tiết nội dung thay đổi
        $table->timestamps(); // Sẽ tự tạo cột created_at (thời gian)
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
