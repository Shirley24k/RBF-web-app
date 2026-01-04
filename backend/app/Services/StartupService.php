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
        $user = auth()->user();
        
        // If user is startup owner, get their startup
        if ($user->role === 'startup') {
            $startup = Startup::with('user')->where('user_id', $user->id)->first();
            if (!$startup) {
                throw new \Exception('Startup not found');
            }
            return $startup;
        }
        
        // If user is staff, get their associated startup
        if ($user->role === 'staff') {
            $staff = $user->staff()->first();
            if (!$staff || $staff->status !== 'ACTIVE') {
                throw new \Exception('Staff member not found or inactive');
            }
            
            $startup = Startup::with('user')->find($staff->startup_id);
            if (!$startup) {
                throw new \Exception('Associated startup not found');
            }
            return $startup;
        }
        
        throw new \Exception('User is not authorized to access startup features');
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