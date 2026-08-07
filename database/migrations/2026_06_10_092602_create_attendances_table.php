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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('classroom_id');

            $table->date('attendance_date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();

            $table->string('status')->default('present'); 
            // present, late, absent

            $table->timestamps();

            // allow one attendance entry per student per subject per day
            $table->unique(['user_id', 'subject_id', 'attendance_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
