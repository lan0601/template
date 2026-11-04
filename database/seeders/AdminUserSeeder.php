<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Userrole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $masterAdminRoleId = Userrole::query()
            ->where('role_name', env('MASTER_ADMIN_ROLE', 'admin'))
            ->firstOrFail()
            ->id;

        User::updateOrCreate(
            ['email' => env('MASTER_ADMIN_EMAIL')],
            [
                'name' => env('MASTER_ADMIN_NAME'),
                'password' => Hash::make(
                    env('MASTER_ADMIN_PASSWORD')
                ),
                'userroleid' => $masterAdminRoleId,
            ]
        );
    }
}
