<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\UserService;
use App\Services\InvestorService;
use App\Services\StartupService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(UserService::class, function ($app) {
            return new UserService();
        });

        $this->app->singleton(InvestorService::class, function ($app) {
            return new InvestorService($app->make(UserService::class));
        });

        $this->app->singleton(StartupService::class, function ($app) {
            return new StartupService($app->make(UserService::class));
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
