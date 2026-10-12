<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('external_attendances', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            $table->foreignId('cancelled_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable()->after('time_in');
            $table->boolean('is_active')->default(true)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('external_attendances', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn(['created_by', 'cancelled_by', 'cancelled_at', 'is_active']);
        });
    }
};