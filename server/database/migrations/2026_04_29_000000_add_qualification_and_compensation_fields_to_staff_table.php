<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('highest_degree')->nullable()->after('certificate_file');
            $table->string('major')->nullable()->after('highest_degree');
            $table->string('school')->nullable()->after('major');
            $table->unsignedSmallInteger('graduation_year')->nullable()->after('school');
            $table->string('practice_certificate')->nullable()->after('graduation_year');

            $table->decimal('base_salary', 12, 2)->nullable()->after('practice_certificate');
            $table->enum('salary_type', ['hourly', 'monthly'])->nullable()->after('base_salary');
            $table->string('bank_name')->nullable()->after('salary_type');
            $table->string('bank_account', 64)->nullable()->after('bank_name');
            $table->string('tax_code', 32)->nullable()->after('bank_account');
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn([
                'highest_degree',
                'major',
                'school',
                'graduation_year',
                'practice_certificate',
                'base_salary',
                'salary_type',
                'bank_name',
                'bank_account',
                'tax_code',
            ]);
        });
    }
};
