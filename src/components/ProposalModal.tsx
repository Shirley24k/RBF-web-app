import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { getIndustryLabel } from "../utils/industryOptions";

interface Proposal {
  id: string;
  title: string;
  company_name: string;
  company_industry: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  business_model: string;
  target_market: string;
  unique_value_proposition: string;
  competitive_advantage: string;
  business_goals: string;
  market_size: string;
  market_growth_rate: string;
  market_trends: string;
  competition_analysis: string;
  customer_segments: string;
  funding_amount: number;
  funding_stage: string;
  funding_purpose: string;
  current_revenue: number;
  projected_revenue_12m: number;
  projected_revenue_24m: number;
  current_profit_margin: number;
  projected_profit_margin: number;
  break_even_point: string;
  cash_flow_analysis: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface ProposalModalProps {
  open: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  title?: string;
}

export const ProposalModal = ({ 
  open, 
  onClose, 
  proposal, 
  title = "Proposal Details" 
}: ProposalModalProps) => {
  return (
    <Dialog 
      open={open} 
      handler={onClose}
      size="xl"
      className="max-h-[80vh] overflow-y-auto"
    >
      <DialogHeader>
        <Typography variant="h5" color="blue-gray">
          {title}
        </Typography>
      </DialogHeader>
      <DialogBody className="space-y-6">
        {proposal ? (
          <>
            {/* Company Overview Section */}
            <div className="border-b border-gray-200 pb-4">
              <Typography variant="h6" color="blue-gray" className="mb-4 text-lg font-semibold">
                Company Overview
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Proposal Title</Typography>
                  <Typography className="mt-1">{proposal.title}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Company Name</Typography>
                  <Typography className="mt-1">{proposal.company_name}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Industry</Typography>
                  <Typography className="mt-1">{getIndustryLabel(proposal.company_industry)}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Contact Person</Typography>
                  <Typography className="mt-1">{proposal.contact_person}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Contact Email</Typography>
                  <Typography className="mt-1">{proposal.contact_email}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Contact Phone</Typography>
                  <Typography className="mt-1">{proposal.contact_phone}</Typography>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Business Model</Typography>
                  <Typography className="mt-1">{proposal.business_model}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Target Market</Typography>
                  <Typography className="mt-1">{proposal.target_market}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Unique Value Proposition</Typography>
                  <Typography className="mt-1">{proposal.unique_value_proposition}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Competitive Advantage</Typography>
                  <Typography className="mt-1">{proposal.competitive_advantage}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Business Goals</Typography>
                  <Typography className="mt-1">{proposal.business_goals}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Market Size</Typography>
                  <Typography className="mt-1">{proposal.market_size}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Market Growth Rate</Typography>
                  <Typography className="mt-1">{proposal.market_growth_rate}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Market Trends</Typography>
                  <Typography className="mt-1">{proposal.market_trends}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Competition Analysis</Typography>
                  <Typography className="mt-1">{proposal.competition_analysis}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Customer Segments</Typography>
                  <Typography className="mt-1">{proposal.customer_segments}</Typography>
                </div>
              </div>
            </div>

            {/* Funding Requirements Section */}
            <div className="border-b border-gray-200 pb-4">
              <Typography variant="h6" color="blue-gray" className="mb-4 text-lg font-semibold">
                Funding Requirements
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Funding Amount</Typography>
                  <Typography className="mt-1">RM{proposal.funding_amount?.toLocaleString()}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Funding Stage</Typography>
                  <Typography className="mt-1">{proposal.funding_stage}</Typography>
                </div>
              </div>
              <div className="mt-4">
                <Typography variant="small" color="gray" className="font-medium">Funding Purpose</Typography>
                <Typography className="mt-1">{proposal.funding_purpose}</Typography>
              </div>
            </div>

            {/* Financial Projections Section */}
            <div className="border-b border-gray-200 pb-4">
              <Typography variant="h6" color="blue-gray" className="mb-4 text-lg font-semibold">
                Financial Projections
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Current Revenue</Typography>
                  <Typography className="mt-1">RM{proposal.current_revenue?.toLocaleString()}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Current Profit Margin</Typography>
                  <Typography className="mt-1">{proposal.current_profit_margin}%</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Projected Revenue (12M)</Typography>
                  <Typography className="mt-1">RM{proposal.projected_revenue_12m?.toLocaleString()}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Projected Revenue (24M)</Typography>
                  <Typography className="mt-1">RM{proposal.projected_revenue_24m?.toLocaleString()}</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Projected Profit Margin</Typography>
                  <Typography className="mt-1">{proposal.projected_profit_margin}%</Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Break Even Point</Typography>
                  <Typography className="mt-1">{proposal.break_even_point}</Typography>
                </div>
              </div>
              <div className="mt-4">
                <Typography variant="small" color="gray" className="font-medium">Cash Flow Analysis</Typography>
                <Typography className="mt-1">{proposal.cash_flow_analysis}</Typography>
              </div>
            </div>

            {/* System Information Section */}
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-4 text-lg font-semibold">
                System Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Status</Typography>
                  <Typography className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      proposal.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      proposal.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {proposal.status}
                    </span>
                  </Typography>
                </div>

                <div>
                  <Typography variant="small" color="gray" className="font-medium">Created</Typography>
                  <Typography className="mt-1">
                    {new Date(proposal.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" color="gray" className="font-medium">Last Updated</Typography>
                  <Typography className="mt-1">
                    {new Date(proposal.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button
          variant="outlined"
          onClick={onClose}
          className="bg-dark-plum hover:bg-light-purple text-white capitalize text-sm font-semibold"
        >
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
