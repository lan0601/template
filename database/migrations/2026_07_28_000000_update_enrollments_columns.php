<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Final columns: id, user_id, school_year, section_id, status, timestamps
     */
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            // Drop the foreign key and column for subject_id
            // Note: FK was created when table was still named 'enrolls', hence the legacy name
            $table->dropForeign('enrolls_subject_id_foreign');
            $table->dropColumn('subject_id');

            // Drop the semester column
            $table->dropColumn('semester');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->unsignedBigInteger('subject_id')->nullable()->after('user_id');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
            $table->string('semester')->nullable()->after('school_year');
        });
    }
};
