<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('user_roles', 'permissions')) {
            Schema::table('user_roles', function (Blueprint $table) {
                $table->json('permissions')->nullable()->after('role_name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('user_roles', 'permissions')) {
            Schema::table('user_roles', function (Blueprint $table) {
                $table->dropColumn('permissions');
            });
        }
    }
};
