<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProposalsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->string('title');

            // Company Overview fields
            $table->string('company_name');
            $table->string('company_industry');
            $table->string('contact_person');
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('business_model')->nullable();
            $table->text('target_market')->nullable();
            $table->text('unique_value_proposition')->nullable();
            $table->text('competitive_advantage')->nullable();
            $table->text('business_goals')->nullable();
            $table->string('market_size')->nullable();
            $table->string('market_growth_rate')->nullable();
            $table->text('market_trends')->nullable();
            $table->text('competition_analysis')->nullable();
            $table->text('customer_segments')->nullable();
            
            // Funding Requirements fields
            $table->decimal('funding_amount', 15, 2);
            $table->string('funding_stage');
            $table->text('funding_purpose');

            // Financial Projections fields
            $table->decimal('current_revenue', 15, 2)->default(0.00);
            $table->decimal('projected_revenue_12m', 15, 2)->default(0.00);
            $table->decimal('projected_revenue_24m', 15, 2)->default(0.00);
            $table->decimal('current_profit_margin', 5, 2)->default(0.00);
            $table->decimal('projected_profit_margin', 5, 2)->default(0.00);
            $table->string('break_even_point')->default('null');
            $table->text('cash_flow_analysis')->default('null');
           
            $table->enum('status', ['DRAFT', 'REVIEWING','REVIEWED'])->default('DRAFT');
            $table->unsignedBigInteger('startup_id');
            $table->timestamps();

            $table->foreign('startup_id')->references('id')->on('startups')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('proposals');
    }
}
