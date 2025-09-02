<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Staff;
use App\Models\Startup;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get the first startup to assign staff to
        $startup = Startup::first();
        
        if (!$startup) {
            $this->command->info('No startup found. Skipping staff seeding.');
            return;
        }

        // Create staff users
        $staffData = [
            [
                'name' => 'John Manager',
                'email' => 'john.manager@cashflow.my',
                'position' => 'Operations Manager',
                'permissions' => [
                    'create_proposal',
                    'edit_proposal', 
                    'view_proposal',
                    'view_application_details',
                    'view_transaction_details'
                ]
            ],
            [
                'name' => 'Sarah Analyst',
                'email' => 'sarah.analyst@cashflow.my',
                'position' => 'Business Analyst',
                'permissions' => [
                    'view_proposal',
                    'view_application_details',
                    'view_transaction_details'
                ]
            ],
            [
                'name' => 'Mike Editor',
                'email' => 'mike.editor@cashflow.my',
                'position' => 'Content Editor',
                'permissions' => [
                    'edit_proposal',
                    'view_proposal'
                ]
            ]
        ];

        foreach ($staffData as $staffInfo) {
            // Create user account
            $user = User::create([
                'email' => $staffInfo['email'],
                'password' => Hash::make('password123'),
                'role' => 'staff',
                'email_verified_at' => now(),
            ]);

            // Create staff record
            Staff::create([
                'user_id' => $user->id,
                'startup_id' => $startup->id,
                'name' => $staffInfo['name'],
                'position' => $staffInfo['position'],
                'permissions' => $staffInfo['permissions'],
                'status' => 'ACTIVE'
            ]);
        }
    }
}
