<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('Starting database seeding...');

        $this->call([
            // First create users (required for all other entities)
            UserSeeder::class,

            // Then create startups and investors (depend on users)
            StartupSeeder::class,
            InvestorSeeder::class,

            // Create staff members (depend on startups)
            StaffSeeder::class,

            // Create proposals (depend on startups)
            ProposalSeeder::class,

            // Create applications (depend on proposals, startups, and investors)
            ApplicationSeeder::class,

            // Create agreements and transactions (depend on applications)
            AgreementSeeder::class,
            TransactionSeeder::class,
        ]);

        $this->command->info('Database seeding completed successfully!');
    }
}
