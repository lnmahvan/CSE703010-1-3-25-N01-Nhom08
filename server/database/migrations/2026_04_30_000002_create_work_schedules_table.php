<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('shift_template_id')->nullable()
                ->constrained('work_shift_templates')->nullOnDelete();

            $table->date('work_date');
            $table->time('start_time');
            $table->time('end_time');

            $table->string('work_role', 64); // e.g. doctor_treatment, doctor_consult, reception, accountant, ...
            $table->string('room')->nullable();
            $table->text('notes')->nullable();

            // scheduled | confirmed | cancelled | completed | swapped
            $table->enum('status', ['scheduled', 'confirmed', 'cancelled', 'completed', 'swapped'])
                ->default('scheduled');

            $table->text('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['staff_id', 'work_date']);
            $table->index(['branch_id', 'work_date']);
            $table->index(['work_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_schedules');
    }
};
