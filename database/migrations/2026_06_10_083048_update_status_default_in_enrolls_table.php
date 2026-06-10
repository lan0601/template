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
        Schema::table('enrolls', function (Blueprint $table) {
             Schema::table('enrolls', function (Blueprint $table) {
                $table->string('status')
                    ->default('active')
                    ->change();
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrolls', function (Blueprint $table) {
            Schema::table('enrolls', function (Blueprint $table) {
                $table->string('status')
                    ->default(null)
                    ->change();
            });
        });
    }
};
