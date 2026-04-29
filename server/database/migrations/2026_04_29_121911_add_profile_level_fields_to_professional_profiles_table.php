<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('professional_profiles', function (Blueprint $table) {
            $table->string('degree')->nullable()->after('notes');
            $table->unsignedSmallInteger('years_experience')->nullable()->after('degree');
            $table->foreignId('branch_id')
                ->nullable()
                ->after('years_experience')
                ->constrained('branches')
                ->nullOnDelete();
            $table->json('service_scope')->nullable()->after('branch_id');
        });
    }

    public function down(): void
    {
        Schema::table('professional_profiles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
            $table->dropColumn(['degree', 'years_experience', 'service_scope']);
        });
    }
};
