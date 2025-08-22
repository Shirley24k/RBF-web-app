<?php

namespace App\Services;

use App\Models\Startup;
use Illuminate\Support\Facades\DB;

class StartupService
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function getCurrentStartup(): Startup
    {
        $startup = Startup::where('user_id', auth()->user()->id)->first();
        if (!$startup) {
            throw new \Exception('Startup not found');
        }
        return $startup;
    }

    public function createStartup(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Create user record using the service
            $user = $this->userService->createUser($data, 'startup');

            // Create startup record with user_id
            $startup = Startup::create([
                'name' => $data['name'],
                'contact_no' => $data['contact_no'],
                'company_name' => $data['company_name'],
                'company_sector' => $data['company_sector'],
                'company_address' => $data['company_address'],
                'user_id' => $user->id
            ]);

            return $startup;
        });
    }

} 