<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\UserService;
use App\Services\InvestorService;
use App\Services\StartupService;
use App\Services\Neo4jService;
use App\Services\StripeService;
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
            return new InvestorService(
                $app->make(UserService::class),
                $app->make(StripeService::class)
            );
        });

        $this->app->singleton(StartupService::class, function ($app) {
            return new StartupService($app->make(UserService::class));
        });

        $this->app->singleton(Neo4jService::class, function ($app) {
            return new Neo4jService();
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        \App\Models\Investor::observe(\App\Observers\InvestorObserver::class);
        \App\Models\Startup::observe(\App\Observers\StartupObserver::class);
    }
}
