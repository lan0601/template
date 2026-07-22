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
        Schema::create('subject_offerings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();

            $table->string('section');
            $table->tinyInteger('term');        // 1, 2, 3, 4
            $table->string('school_year');      // e.g. 2026-2027
            $table->string('semester');         // 1st Semester, 2nd Semester

            $table->string('day');              // Monday
            $table->time('start_time');
            $table->time('end_time');

            $table->integer('capacity')->default(50);

            $table->tinyInteger('status')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_offerings');
    }
};
