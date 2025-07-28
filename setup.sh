#!/bin/bash 
echo "Running database migrations"

# Drop previous migration and rerun migrations
php artisan migrate:fresh

# Run seeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=StartupSeeder
php artisan db:seed --class=InvestorSeeder
php artisan db:seed --class=ApplicationSeeder
php artisan db:seed --class=AgreementSeeder
php artisan db:seed --class=TransactionSeeder
