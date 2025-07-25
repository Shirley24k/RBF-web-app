<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agreement;

class AgreementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Agreement::create([
            'application_id' => 3,
            'startup_agreement_path' => 'Agreement sample.pdf',
            'investor_agreement_path' => 'Agreement sample.pdf',
            'message' => 'Application approved by admin',
            'needs_startup_reupload' => false,
            'needs_investor_reupload' => false,
        ]);
    }
}
