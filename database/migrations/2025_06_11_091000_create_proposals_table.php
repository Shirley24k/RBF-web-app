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
            $table->string('company_industry')->nullable()->after('company_name');
            $table->string('contact_person')->nullable()->after('company_industry');
            $table->string('contact_email')->nullable()->after('contact_person');
            $table->string('contact_phone')->nullable()->after('contact_email');
            $table->text('business_model')->nullable()->after('contact_phone');
            $table->text('target_market')->nullable()->after('business_model');
            $table->text('unique_value_proposition')->nullable()->after('target_market');
            $table->text('competitive_advantage')->nullable()->after('unique_value_proposition');
            $table->text('business_goals')->nullable()->after('competitive_advantage');
            $table->string('market_size')->nullable()->after('business_goals');
            $table->string('market_growth_rate')->nullable()->after('market_size');
            $table->text('market_trends')->nullable()->after('market_growth_rate');
            $table->text('competition_analysis')->nullable()->after('market_trends');
            $table->text('customer_segments')->nullable()->after('competition_analysis');
            
            // Funding Requirements fields
            $table->decimal('funding_amount', 15, 2);
            $table->string('funding_stage');
            $table->text('funding_purpose');

            // Financial Projections fields
            $table->decimal('current_revenue', 15, 2)->nullable()->after('funding_purpose');
            $table->decimal('projected_revenue_12m', 15, 2)->nullable()->after('current_revenue');
            $table->decimal('projected_revenue_24m', 15, 2)->nullable()->after('projected_revenue_12m');
            $table->decimal('current_profit_margin', 5, 2)->nullable()->after('projected_revenue_24m');
            $table->decimal('projected_profit_margin', 5, 2)->nullable()->after('current_profit_margin');
            $table->string('break_even_point')->nullable()->after('projected_profit_margin');
            $table->text('cash_flow_analysis')->nullable()->after('break_even_point');
           
            $table->enum('status', ['DRAFT','REVIEWED'])->default('DRAFT');
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
