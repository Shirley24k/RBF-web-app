<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Proposal;
use App\Models\Startup;

class ProposalSeeder extends Seeder
{
    public function run(): void
    {
        $startups = Startup::all();
        if ($startups->isEmpty()) {
            $this->command->info('No startups found. Please run StartupSeeder first.');
            return;
        }

        foreach ($startups as $startup) {
            // Create a draft proposal
            Proposal::create([
                'startup_id' => $startup->id,
                
                // Company Overview
                'title' => 'Investment Proposal: CashFlow Solutions Seed Funding Round',
                'company_name' => $startup->company_name,
                'company_industry' => $startup->company_sector,
                'contact_person' => $startup->name,
                'contact_email' => $startup->user->email,
                'contact_phone' => $startup->contact_no,
                'business_model' => 'SaaS solution that provides real-time financial insights, automates invoice reminders, and forecasts cash flow with high accuracy.',
                'target_market' => 'Small-to-medium enterprises (SMEs) in Malaysia.',
                'unique_value_proposition' => 'Automated cash flow management platform.',
                'competitive_advantage' => 'Real-time financial insights, seamless integration with existing accounting software, and accurate cash flow forecasting.',
                'business_goals' => 'To finalize platform development, establish strategic partnerships, and acquire our initial user base to capture a significant share of the underserved SME market.',
                'market_size' => 'RM 2.5 billion annually',
                'market_growth_rate' => '15% annually',
                'market_trends' => 'Growing demand for digital solutions post-pandemic and rising need for automated financial management tools for SMEs.',
                'competition_analysis' => 'Competing with manual processes and outdated software, but differentiated by our all-in-one SaaS solution and real-time functionality.',
                'customer_segments' => 'Primary: Small to medium-sized businesses (SMEs) in Malaysia.',
                
                // Funding Requirements
                'funding_amount' => 500000.00,
                'funding_stage' => 'seed',
                'funding_purpose' => 'Product development, marketing campaigns, and working capital to support the initial launch and user acquisition.',

                // Financial Projections
                'current_revenue' => 50000.00,
                'projected_revenue_12m' => 150000.00,
                'projected_revenue_24m' => 500000.00,
                'current_profit_margin' => 5.00,
                'projected_profit_margin' => 20.00,
                'break_even_point' => '18 months',
                'cash_flow_analysis' => 'Initial cash flow will be negative due to development and marketing costs, but will turn positive as recurring revenue from our growing customer base surpasses our operational expenses.',
                // System fields
                'status' => 'DRAFT'
            ]);

            // Create a reviewed proposal
            Proposal::create([
                'startup_id' => $startup->id,

                // Company Overview
                'title' => 'AI-Powered FinTech Innovation',
                'company_name' => $startup->company_name,
                'company_industry' => $startup->company_sector,
                'contact_person' => $startup->name,
                'contact_email' => $startup->user->email,
                'contact_phone' => $startup->contact_no,
                'business_model' => 'AI-driven financial advisory platform using machine learning to provide personalized investment recommendations and portfolio management.',
                'target_market' => 'Young professionals and small investors in Malaysia seeking accessible, intelligent financial planning tools.',
                'unique_value_proposition' => 'Combines advanced AI algorithms with local market expertise to deliver personalized financial advice at a fraction of traditional advisor costs.',
                'competitive_advantage' => 'Proprietary AI models trained on Southeast Asian market data, regulatory compliance expertise, and seamless integration with local banking systems.',
                'business_goals' => 'Launch AI-powered investment platform, achieve 10,000 active users within 18 months, and expand to Singapore and Indonesia.',
                'market_size' => 'RM 1.8 billion',
                'market_growth_rate' => '22% annually',
                'market_trends' => 'Growing demand for digital financial services, increasing retail investor participation, and regulatory support for fintech innovation.',
                'competition_analysis' => 'Competing with traditional banks and international fintech platforms, but differentiated by local market focus and AI capabilities.',
                'customer_segments' => 'Primary: Young professionals (25-40), Secondary: Small business owners, Tertiary: Retirees seeking passive income',

                // Funding Requirements
                'funding_amount' => 150000.00,
                'funding_stage' => 'seed',
                'funding_purpose' => 'AI model development, regulatory compliance, and market launch',

                // Financial Projections
                'current_revenue' => 50000.00,
                'projected_revenue_12m' => 300000.00,
                'projected_revenue_24m' => 800000.00,
                'current_profit_margin' => 15.00,
                'projected_profit_margin' => 28.00,
                'break_even_point' => '24 months',
                'cash_flow_analysis' => 'Initial investment covers AI development and compliance costs. Revenue from subscription fees and transaction commissions will fund operations and expansion.',

                // System fields
                'status' => 'REVIEWED'
            ]);

            // Create a draft proposal
            Proposal::create([
                'startup_id' => $startup->id,

                // Company Overview
                'title' => 'Template: HealthTech Innovation',
                'company_name' => $startup->company_name,
                'company_industry' => $startup->company_sector,
                'contact_person' => $startup->name,
                'contact_email' => $startup->user->email,
                'contact_phone' => $startup->contact_no,
                'business_model' => 'Template for healthtech product development funding requests. This can be customized for different healthcare initiatives.',
                'target_market' => 'Template target market section. Include your specific healthcare market segments and patient demographics here.',
                'unique_value_proposition' => 'Template unique value proposition. Explain what makes your healthtech solution different from existing healthcare technologies.',
                'competitive_advantage' => 'Template competitive advantage. Identify and analyze your competitive strengths in the healthcare market.',
                'business_goals' => 'Template business goals. Include your healthcare innovation objectives and patient impact targets.',
                'market_size' => 'Template market size. Include your total addressable healthcare market and serviceable patient population.',
                'market_growth_rate' => 'Template growth rate. Include healthcare market growth projections and adoption trends.',
                'market_trends' => 'Template market trends. Include current healthcare dynamics, emerging technologies, and market timing analysis.',
                'competition_analysis' => 'Template competition analysis. Include key healthcare competitors, competitive landscape, and your differentiation strategy.',
                'customer_segments' => 'Template customer segments. Include detailed patient demographics, healthcare provider needs, and segmentation strategy.',

                // Funding Requirements
                'funding_amount' => 400000.00,
                'funding_stage' => 'seed',
                'funding_purpose' => 'Healthcare product development and regulatory approval',

                // Financial Projections
                'current_revenue' => 25000.00,
                'projected_revenue_12m' => 150000.00,
                'projected_revenue_24m' => 400000.00,
                'current_profit_margin' => 18.00,
                'projected_profit_margin' => 32.00,
                'break_even_point' => '30 months',
                'cash_flow_analysis' => 'Template cash flow analysis. Include your healthcare revenue projections, regulatory compliance costs, and funding requirements.',

                // System fields
                'status' => 'DRAFT'
            ]);
        }

        $this->command->info('Proposals seeded successfully!');
    }
}
