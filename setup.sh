#!/bin/bash 
echo "Running database migrations"

# Drop previous migration and rerun migrations
php artisan migrate:fresh

# Run seeder
php artisan db:seed
