<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('external_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('campus_id');
            $table->string('employee_no');
            $table->string('subject_code');
            $table->string('class_room')->nullable();
            $table->date('attendance_date');
            $table->time('time_in')->nullable();
            $table->enum('status', ['present', 'absent'])->default('present');
            $table->timestamps();

            $table->unique(
                ['user_id', 'subject_code', 'attendance_date'],
                'external_attendance_user_subject_date_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('external_attendances');
    }
};