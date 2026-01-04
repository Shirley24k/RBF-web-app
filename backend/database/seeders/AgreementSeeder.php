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
        // Get the completed, active, and pending applications to use for agreements
        $application = Application::whereIn('status', ['Completed', 'Active', 'Pending'])->get();

        if ($application->isEmpty()) {
            $this->command->info('No completed applications found. Please run ApplicationSeeder first.');
            return;
        }

        foreach ($application as $application) {
            Agreement::create([
                'application_id' => $application->id,
                'startup_agreement_path' => 'Completed Agreement.pdf',
                'investor_agreement_path' => 'Completed Agreement.pdf',
                'message' => 'Application approved by admin',
                'needs_startup_reupload' => false,
                'needs_investor_reupload' => false,
            ]);
        }

        $this->command->info('Agreements seeded successfully!');
    }
}
