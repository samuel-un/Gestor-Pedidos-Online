<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            OrderSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@ordermanager.pro',
        ]);
    }
}