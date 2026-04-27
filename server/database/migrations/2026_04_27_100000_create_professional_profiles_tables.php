<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professional_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->enum('profile_role', ['bac_si', 'ke_toan']);
            $table->enum('status', ['draft', 'pending', 'approved', 'expired', 'rejected', 'inactive'])->default('draft');
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('invalidated_at')->nullable();
            $table->foreignId('invalidated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['staff_id', 'profile_role']);
            $table->index(['profile_role', 'status']);
        });

        Schema::create('professional_profile_specialties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_profile_id')
                ->constrained('professional_profiles', indexName: 'pps_profile_fk')
                ->cascadeOnDelete();
            $table->string('specialty_name');
            $table->string('degree')->nullable();
            $table->unsignedInteger('years_experience')->default(0);
            $table->json('service_scope')->nullable();
            $table->string('branch_or_room')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('professional_profile_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_profile_id')
                ->constrained('professional_profiles', indexName: 'ppc_profile_fk')
                ->cascadeOnDelete();
            $table->foreignId('professional_profile_specialty_id')
                ->nullable()
                ->constrained('professional_profile_specialties', indexName: 'ppc_specialty_fk')
                ->nullOnDelete();
            $table->string('certificate_type');
            $table->string('certificate_name');
            $table->string('certificate_number');
            $table->date('issued_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('issuer')->nullable();
            $table->string('scope_label')->nullable();
            $table->text('notes')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_mime', 100);
            $table->unsignedBigInteger('file_size');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['certificate_number', 'certificate_type'], 'pp_cert_number_type_unique');
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professional_profile_certificates');
        Schema::dropIfExists('professional_profile_specialties');
        Schema::dropIfExists('professional_profiles');
    }
};
