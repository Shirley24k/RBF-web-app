<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Startup;
class StartupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Startup::create([
            'name' => 'Alex Wong',
            'contact_no' => '+60125675678',
            'company_name' => 'Startup 1',
            'company_sector' => 'FinTech',
            'company_address' => '123, Jalan Merdeka, 56000 Kuala Lumpur',
            'stripe_id' => 'acct_1RcP7M4YDZmtY5Om',
            'user_id' => 2
        ]);

    }
}
