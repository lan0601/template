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
        Schema::create('external_schedules', function (Blueprint $table) {
        $table->id();

        // Source system identifiers
        $table->string('student_no')->nullable();
        $table->string('school_year')->nullable();
        $table->string('semester_code')->nullable();

        // Subject
        $table->string('subject_code')->nullable();
        $table->string('description')->nullable();

        // Schedule
        $table->string('days_code')->nullable();
        $table->time('start_time')->nullable();
        $table->time('end_time')->nullable();

        // Section / room
        $table->string('block_section')->nullable();
        $table->string('class_room')->nullable();

        // Teacher
        $table->string('employee_no')->nullable();
        $table->string('employee_last_name')->nullable();
        $table->string('employee_first_name')->nullable();
        $table->string('employee_middle_name')->nullable();

        // Sync information
        $table->timestamp('source_updated_at')->nullable();
        $table->timestamp('last_synced_at')->nullable();

        $table->boolean('is_active')->default(true);

        // Laravel timestamps
        $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('external_schedules');
    }
};
