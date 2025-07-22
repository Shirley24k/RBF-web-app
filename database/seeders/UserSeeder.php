<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create admin user
        User::create([
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin'
        ]);

        // Create startup user
        User::create([
            'email' => 'startup@gmail.com',
            'password' => Hash::make('startup123'),
            'role' => 'startup'
        ]);

        // Create investor user
        User::create(
        [
            'email' => 'investor@gmail.com',
            'password' => Hash::make('investor123'),
            'role' => 'investor'
        ]);

        User::create([
            'email' => 'investorfirm@gmail.com',
            'password' => Hash::make('investor123'),
            'role' => 'investor'
        ]);

        User::create([
            'email' => 'investor2@gmail.com',
            'password' => Hash::make('investor123'),
            'role' => 'investor'
        ]);

        User::create([
            'email' => 'investor3@gmail.com',
            'password' => Hash::make('investor123'),
            'role' => 'investor'
        ]);
    }  
}
