<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

class UserService
{
    public function createUser(array $data, string $role)
    {
        $user = User::create([
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $role
        ]);

        // Fire registration event and send verification email
        event(new Registered($user));
        $user->sendEmailVerificationNotification();

        return $user;
    }
} 