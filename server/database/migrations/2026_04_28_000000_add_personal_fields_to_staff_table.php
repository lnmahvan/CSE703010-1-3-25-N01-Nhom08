<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->date('birthday')->nullable()->after('full_name');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('birthday');
            $table->string('id_card', 32)->nullable()->after('gender');
            $table->boolean('id_card_verified')->default(false)->after('id_card');
            $table->string('nationality')->nullable()->default('Việt Nam')->after('id_card_verified');
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn(['birthday', 'gender', 'id_card', 'id_card_verified', 'nationality']);
        });
    }
};
