<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class EnableRlsOnAllTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //enable rls on all tables
        $tables = DB::select('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'');
        foreach ($tables as $table) {
            DB::statement("ALTER TABLE {$table->tablename} ENABLE ROW LEVEL SECURITY");
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //disable rls on all tables
        $tables = DB::select('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'');
        foreach ($tables as $table) {
            DB::statement("ALTER TABLE {$table->tablename} DISABLE ROW LEVEL SECURITY");
        }
    }
}
