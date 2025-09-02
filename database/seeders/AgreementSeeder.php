<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agreement;
use App\Models\Application;

class AgreementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get the first completed application to use for agreement
        $application = Application::where('status', 'Completed')->first();

        if (!$application) {
            $this->command->info('No completed applications found. Please run ApplicationSeeder first.');
            return;
        }

        Agreement::create([
            'application_id' => $application->id,
            'startup_agreement_path' => 'Completed Agreement.pdf',
            'investor_agreement_path' => 'Completed Agreement.pdf',
            'message' => 'Application approved by admin',
            'needs_startup_reupload' => false,
            'needs_investor_reupload' => false,
        ]);

        $activeApplication = Application::where('status', 'Active')->first();
        if (!$activeApplication) {
            $this->command->info('No active applications found. Please run ApplicationSeeder first.');
            return;
        }

        Agreement::create([
            'application_id' => $activeApplication->id,
            'startup_agreement_path' => 'Completed Agreement.pdf',
            'investor_agreement_path' => 'Completed Agreement.pdf',
            'message' => 'Application approved by admin',
            'needs_startup_reupload' => false,
            'needs_investor_reupload' => false,
        ]);

        $this->command->info('Agreements seeded successfully!');
    }
}
