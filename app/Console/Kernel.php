<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Process delayed transfers every 5 minutes
        $schedule->command('transfers:process-delayed')
            ->everyFiveMinutes()
            ->withoutOverlapping()
            ->runInBackground()
            ->onFailure(function () {
                \Log::error('Delayed transfers processing failed');
            });

        // Send repayment reminders 3 days before processing (28th of each month at 10 AM)
        // $schedule->command('repayments:send-reminders')
        //     ->monthlyOn(28, '10:00')
        //     ->withoutOverlapping()
        //     ->runInBackground()
        //     ->onFailure(function () {
        //         \Log::error('Repayment reminder sending failed');
        //     });
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
