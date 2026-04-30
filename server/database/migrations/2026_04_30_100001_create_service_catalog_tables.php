<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_groups', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->string('slug', 80)->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('specialties', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('service_code', 30)->nullable()->unique()->after('id');
            $table->foreignId('service_group_id')->nullable()->after('service_code')
                ->constrained('service_groups')->nullOnDelete();
            $table->text('description')->nullable()->after('name');
            $table->unsignedInteger('duration_minutes')->nullable()->after('price');
            $table->enum('status', ['draft', 'active', 'hidden', 'discontinued'])
                ->default('draft')->after('commission_rate');
            $table->enum('visibility', ['public', 'internal'])->default('internal')->after('status');
            $table->text('notes')->nullable()->after('visibility');
            $table->string('image_path')->nullable()->after('notes');
            $table->foreignId('created_by')->nullable()->after('image_path')
                ->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->after('created_by')
                ->constrained('users')->nullOnDelete();
            $table->index(['status', 'visibility']);
            $table->index('service_group_id');
        });

        Schema::create('service_specialty', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('specialty_id')->constrained('specialties')->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->unique(['service_id', 'specialty_id']);
            $table->index(['service_id', 'is_primary']);
        });

        Schema::create('service_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->enum('attachment_type', ['image', 'document'])->default('document');
            $table->enum('visibility', ['public', 'internal'])->default('internal');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_mime', 120)->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('description')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['service_id', 'attachment_type']);
        });

        Schema::create('service_price_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->decimal('old_price', 15, 2)->nullable();
            $table->decimal('new_price', 15, 2);
            $table->date('effective_date')->nullable();
            $table->string('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->index('service_id');
        });

        Schema::create('service_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('old_status', 30)->nullable();
            $table->string('new_status', 30);
            $table->string('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->index('service_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_status_history');
        Schema::dropIfExists('service_price_history');
        Schema::dropIfExists('service_attachments');
        Schema::dropIfExists('service_specialty');

        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['service_group_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropIndex(['status', 'visibility']);
            $table->dropIndex(['service_group_id']);
            $table->dropColumn([
                'service_code', 'service_group_id', 'description', 'duration_minutes',
                'status', 'visibility', 'notes', 'image_path', 'created_by', 'updated_by',
            ]);
        });

        Schema::dropIfExists('specialties');
        Schema::dropIfExists('service_groups');
    }
};
