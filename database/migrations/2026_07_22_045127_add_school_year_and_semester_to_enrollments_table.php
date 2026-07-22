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
        Schema::table('enrollments', function (Blueprint $table) {
            $table->unsignedBigInteger('section_id')->after('subject_id');
            $table->foreign('section_id')->references('id')->on('sections')->onDelete('cascade');
            $table->string('school_year')->after('section_id');
            $table->string('semester')->after('school_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn(['school_year', 'semester']);
        });
    }
};
