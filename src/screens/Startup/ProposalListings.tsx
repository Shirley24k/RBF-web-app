import {
  ExclamationTriangleIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  CardBody,
  Tooltip,
  Typography
} from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProposalModal } from "../../components/ProposalModal";
import { Sidenav } from "../../components/sidenav";
import { getIndustryLabel } from "../../utils/industryOptions";
import { handleStaffPermissionError } from "../../utils/permissionHandler";

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

export const ProposalListings = (): JSX.Element => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStartupOwner = user.role === 'startup';

  const fetchProposals = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/startup/proposals`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProposals(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      
      // Handle staff permission errors specifically
      if (handleStaffPermissionError(error, 'Insufficient permissions to view proposals', 'view proposals')) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const openViewModal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="w-8 h-8 border-4 border-dark-plum border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0 z-20">
        <Sidenav active="proposal" />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden z-20">
        <Sidenav active="proposal" />
      </div>

      {/* Main Content */}
      <div className={`ml-72 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 transition-all duration-300`}>
        <div className="max-w-7xl px-4 max-md:px-6 max-sm:px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 max-md:mb-6 max-sm:mb-4 gap-4 max-sm:gap-2">
            <div className="py-8 max-md:py-6 max-sm:py-4">
              <Typography variant="h4" color="blue-gray" className="text-3xl max-md:text-2xl max-sm:text-xl">
                Proposal Management
              </Typography>
              <Typography variant="paragraph" color="gray" className="mt-2">
                View, edit, and manage your business proposals for RBF funding applications
              </Typography>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-md:gap-2 max-sm:gap-2">
              <Button
                className="bg-dark-plum hover:bg-light-purple text-white flex items-center gap-2 capitalize text-sm font-semibold"
                onClick={() => navigate("/proposal-management")}
              >
                <PlusIcon className="h-5 w-5" />
                Create Proposal
              </Button>
            </div>
          </div>

          {/* Proposals List */}
          <div className="mb-8 max-md:mb-6 max-sm:mb-4">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              Your Proposals
            </Typography>
            
            {proposals.length === 0 ? (
              <Card className="p-8 text-center">
                <Typography variant="h6" color="gray" className="mb-2">
                  No proposals available
                </Typography>
                <Typography variant="paragraph" color="gray" className="mb-4">
                  Create your first business proposal to get started with RBF funding applications.
                </Typography>
                <Button
                  className="bg-dark-plum hover:bg-light-purple text-white capitalize text-sm font-semibold"
                  onClick={() => navigate("/proposal-management")}
                >
                  Create First Proposal
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-md:gap-4 max-sm:gap-3 relative z-10">
                {proposals.map((proposal) => (
                  <Card key={proposal.id} className="hover:shadow-lg transition-shadow relative">
                    <CardBody className="p-6 max-md:p-4 max-sm:p-3">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Typography variant="h6" color="blue-gray" className="line-clamp-2 flex-1">
                            {proposal.title}
                          </Typography>
                          {proposal.status === 'REVIEWING' && (
                            <Tooltip 
                            className="bg-gray-300 text-black w-72"
                            content="There are changes required for this proposal. Please edit the proposal to view the reviews and make the changes.">
                              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                            </Tooltip>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <Typography variant="small" color="gray">
                          <strong>Company:</strong> {proposal.company_name}
                        </Typography>
                        <Typography variant="small" color="gray">
                          <strong>Industry:</strong> {getIndustryLabel(proposal.company_industry)}
                        </Typography>
                        <Typography variant="small" color="gray">
                          <strong>Funding:</strong> RM{proposal.funding_amount.toLocaleString()}
                        </Typography>
                        <Typography variant="small" color="gray">
                          <strong>Stage:</strong> {proposal.funding_stage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                        </Typography>
                      </div>

                      <div className="flex flex-wrap gap-2 relative z-20">
                        <Button
                          variant="text"
                          size="sm"
                          className="flex items-center gap-1 text-dark-plum hover:text-light-purple p-2 capitalize cursor-pointer"
                          onClick={() => openViewModal(proposal)}
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </Button>
                        {proposal.status !== 'REVIEWED' && (
                          <>
                          {/* Review button - only visible to startup owners */}
                          {isStartupOwner && (
                            <Button
                              variant="text"
                              size="sm"
                              className="flex items-center gap-1 text-yellow-600 hover:text-yellow-500 p-2 capitalize cursor-pointer"
                              onClick={() => navigate(`/proposal-management?review=${proposal.id}`)}
                            >
                              <EyeIcon className="h-4 w-4" />
                              Review
                            </Button>
                          )}
                          <Button
                            variant="text"
                            size="sm"
                            className="flex items-center gap-1 text-blue-400 hover:text-light-blue p-2 capitalize cursor-pointer"
                            onClick={() => navigate(`/proposal-management?edit=${proposal.id}`)}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            Edit
                          </Button>
                          </>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Proposal Modal */}
      <ProposalModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        proposal={selectedProposal}
        title={`View Proposal: ${selectedProposal?.title || ''}`}
      />
    </div>
  );
};

