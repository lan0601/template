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
            ['email' => 'allantinambacanjr@gmail.com'],
            [
                'name' => 'Allan Tinambacan',
                'lname' => 'Jr',
                'email' => 'allantinambacanjr@gmail.com',
                'password' => Hash::make('1234567890'),
                'role' => 'Admin',
                'userroleid' => 1,
                'email_verified_at' => now(),
            ]
        );
    }
}
