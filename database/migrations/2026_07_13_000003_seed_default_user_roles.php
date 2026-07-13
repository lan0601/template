<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $roles = [
            ['role_name' => 'admin', 'permissions' => ["dashboard" => true, "attendance" => true, "enroll" => true, "schedule" => true, "classroom" => true, "subject" => true, "users" => true]],
            ['role_name' => 'student', 'permissions' => []],
            ['role_name' => 'teacher', 'permissions' => []],
            ['role_name' => 'guest', 'permissions' => []],
        ];

        foreach ($roles as $index => $role) {
            $roleId = $index + 1;

            $existing = DB::table('user_roles')->where('role_name', $role['role_name'])->first();
            if ($existing) {
                DB::table('user_roles')->where('id', $existing->id)->update([
                    'permissions' => json_encode($role['permissions']),
                ]);

                continue;
            }

            DB::table('user_roles')->insert([
                'role_name' => $role['role_name'],
                'permissions' => json_encode($role['permissions']),
            ]);

            $insertedId = DB::getPdo()->lastInsertId();
            if ($insertedId && $insertedId != $roleId) {
                DB::statement('SET IDENTITY_INSERT user_roles ON');
                DB::table('user_roles')->where('id', $insertedId)->update(['id' => $roleId]);
                DB::statement('SET IDENTITY_INSERT user_roles OFF');
            }
        }
    }

    public function down(): void
    {
        DB::table('user_roles')->whereIn('id', [1, 2, 3, 4])->delete();
    }
};
