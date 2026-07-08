<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Todo;

class TodoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Todo::updateOrCreate(
            ['title' => 'Buy milk'],
            [
                'description' => '2% from the supermarket',
                'completed' => false,
            ]
        );

        Todo::updateOrCreate(
            ['title' => 'Finish Laravel project'],
            [
                'description' => 'Complete CRUD API',
                'completed' => false,
            ]
        );

        Todo::updateOrCreate(
            ['title' => 'Go to the gym'],
            [
                'description' => 'Upper body workout',
                'completed' => true,
            ]
        );
    }
}
