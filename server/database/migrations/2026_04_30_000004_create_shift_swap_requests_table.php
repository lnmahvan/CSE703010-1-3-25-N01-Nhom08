<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_swap_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_schedule_id')->constrained('work_schedules')->cascadeOnDelete();
            $table->foreignId('requester_staff_id')->constrained('staff')->cascadeOnDelete();

            $table->foreignId('target_staff_id')->constrained('staff')->cascadeOnDelete();
            // Schedule of target staff that requester wants to swap with (optional).
            $table->foreignId('target_schedule_id')->nullable()
                ->constrained('work_schedules')->nullOnDelete();

            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();

            $table->text('reason')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');

            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['requester_staff_id', 'status']);
            $table->index('target_staff_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_swap_requests');
    }
};
