<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('MASTER_ADMIN_EMAIL')],
            [
                'name' => env('MASTER_ADMIN_NAME'),
                'password' => Hash::make(
                    env('MASTER_ADMIN_PASSWORD')
                ),
                'userroleid' => 1,
            ]
        );
    }
}
