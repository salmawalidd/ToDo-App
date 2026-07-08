<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'salma@example.com'],
            [
                'name' => 'Salma',
                'password' => Hash::make('password123'),
            ]
        );
    }
}
