<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->decimal('revenue_share_percentage', 10, 2)->nullable();
            $table->decimal('repayment_cap', 10, 2)->nullable();
            $table->decimal('cap_multiple', 10, 2)->nullable();
            $table->decimal('total_repaid', 10, 2)->default(0.00);
            $table->unsignedTinyInteger('repayment_date')->nullable();
            $table->enum('status', ['Await Review', 'Pending', 'Rejected', 'In Progress', 'Active', 'Completed', 'Failed']);
            $table->text('message')->nullable(); 
            $table->unsignedBigInteger('startup_id');
            $table->unsignedBigInteger('investor_id')->nullable();
            $table->unsignedBigInteger('proposal_id');
            $table->timestamps();
            $table->foreign('startup_id')->references('id')->on('startups')->onDelete('cascade');
            $table->foreign('investor_id')->references('id')->on('investors')->onDelete('cascade');
            $table->foreign('proposal_id')->references('id')->on('proposals')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('applications');
    }
}
