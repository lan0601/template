<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $indexes = DB::select('SHOW INDEX FROM attendances');
        $indexNames = array_column($indexes, 'Key_name');

        if (in_array('attendances_user_id_attendance_date_unique', $indexNames, true)) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropUnique('attendances_user_id_attendance_date_unique');
            });
        }

        if (!in_array('attendances_user_subject_date_unique', $indexNames, true)) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->unique(['user_id', 'subject_id', 'attendance_date'], 'attendances_user_subject_date_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $indexes = DB::select('SHOW INDEX FROM attendances');
        $indexNames = array_column($indexes, 'Key_name');

        if (in_array('attendances_user_subject_date_unique', $indexNames, true)) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropUnique('attendances_user_subject_date_unique');
            });
        }

        if (!in_array('attendances_user_id_attendance_date_unique', $indexNames, true)) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->unique(['user_id', 'attendance_date']);
            });
        }
    }
};
