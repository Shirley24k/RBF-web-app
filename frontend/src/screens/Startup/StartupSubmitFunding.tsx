import {
  CheckCircleIcon,
  DocumentTextIcon,
  LightBulbIcon,
  PlusIcon
} from "@heroicons/react/24/solid";
import { Card, CardBody, Chip, Option, Select, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import { Sidenav } from "../../components/ui/sidenav";
import Lottie from "lottie-react";
import coinCirclingWallet from "../../assets/coin circling wallet.json";

export const StartupSubmitFunding = (): JSX.Element => {
  const [selectedProposal, setSelectedProposal] = useState<string>("");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/startup/reviewed-proposals`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProposals(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    if (!selectedProposal) {
      alert("Please select a proposal to submit.");
      return;
    }
    try {
      // Navigate directly to processing page with proposal ID
      navigate("/processing-funding", { 
        state: { proposal_id: selectedProposal } 
      });
    } catch (error: any) {
      console.error("Error navigating to processing page:", error);
      alert("Failed to navigate to processing page. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProposalDetails = () => {
    return proposals.find(p => p.id === selectedProposal);
  };

  const selectedProposalData = getSelectedProposalDetails();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Lottie 
          animationData={coinCirclingWallet} 
          loop={true} 
          autoplay={true}
          style={{ width: '15%', height: '15%' }}
        />
        <Typography variant="h4" className="text-xl max-md:text-base font-bold">Loading...</Typography>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="application" />
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="application" />
      </div>
      
      <div className={`ml-40 max-md:ml-24 max-sm:ml-22 mr-6 flex flex-col flex-1 transition-all duration-300`}>
        {/* Main Content */}
        <div className="p-8 max-md:p-6 max-sm:p-4 flex flex-col items-center max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 max-md:mb-8 max-sm:mb-6">
            <Typography variant="h3" color="blue-gray" className="text-4xl max-md:text-3xl max-sm:text-2xl font-bold mb-4">
              Submit Funding Application
            </Typography>
            <Typography variant="paragraph" className="text-gray-600 text-lg max-md:text-base max-sm:text-sm max-w-2xl">
              Choose from your existing business proposals to submit for RBF funding. 
              Our system will automatically process your application and match you with suitable investors.
            </Typography>
          </div>

          {/* Main Form Card */}
          <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardBody className="p-8 max-md:p-6 max-sm:p-2">
              {/* Proposal Selection */}
              <div className="mb-8">
                <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2 text-lg max-sm:text-sm">
                  <DocumentTextIcon className="w-6 h-6 text-dark-plum max-sm:w-4 max-sm:h-4" />
                  Select Your Proposal
                </Typography>
                
                {proposals.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4 max-sm:w-12 max-sm:h-12" />
                    <Typography variant="h6" color="gray" className="mb-2 text-lg max-sm:text-sm">
                      No proposals available
                    </Typography>
                    <Typography variant="paragraph" color="gray" className="mb-4 text-lg max-sm:text-sm">
                      You need to create a business proposal first before submitting for funding.
                    </Typography>
                    <AppButton
                      variant="primary"
                      size="lg"
                      onClick={() => navigate("/proposal-management")}
                    >
                      <span className="flex items-center gap-2 max-sm:text-sm"><PlusIcon className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
                      Create Proposal
                      </span>
                    </AppButton>
                  </div>
                ) : (
                  <>
                    <Select 
                      label="Choose a proposal"
                      value={selectedProposal || ""}
                      onChange={(value) => setSelectedProposal(value || "")}
                      className="w-full mb-6"
                      size="lg"
                    >
                      {proposals.map((proposal) => (
                        <Option key={proposal.id} value={proposal.id}>
                          {proposal.title}
                        </Option>
                      ))}
                    </Select>

                    {/* Selected Proposal Preview */}
                    {selectedProposalData && (
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mt-4">
                        <CardBody className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Typography variant="h6" color="blue-gray" className="font-semibold text-lg max-sm:text-sm">
                              {selectedProposalData.title}
                            </Typography>
                            <Chip 
                              value={selectedProposalData.funding_stage} 
                              size="sm" 
                              className="bg-blue-100 text-blue-800 capitalize"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Typography variant="small" color="gray" className="font-medium mb-1 text-lg max-sm:text-sm">
                                Company
                              </Typography>
                              <Typography variant="paragraph" className="font-semibold text-lg max-sm:text-sm">
                                {selectedProposalData.company_name}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="small" color="gray" className="font-medium mb-1 text-lg max-sm:text-sm">
                                Funding Amount
                              </Typography>
                              <Typography variant="paragraph" className="font-semibold text-green-600 text-lg max-sm:text-sm">
                                RM{selectedProposalData.funding_amount?.toLocaleString() || '0'}
                              </Typography>
                            </div>
                          </div>
                          
                          <div>
                            <Typography variant="small" color="gray" className="font-medium mb-1 text-lg max-sm:text-sm">
                              Purpose
                            </Typography>
                            <Typography variant="paragraph" className="text-gray-700 text-lg max-sm:text-sm">
                              {selectedProposalData.funding_purpose}
                            </Typography>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">               
                {proposals.length > 0 && (
                  <AppButton
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!selectedProposal || loading}
                    loading={loading}
                  >
                    Submit Application
                  </AppButton>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 max-sm:hidden">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <Typography variant="h6" color="green" className="mb-2">
                  Quick Submission
                </Typography>
                <Typography variant="small" color="gray">
                  Submit your application in minutes using your existing proposal
                </Typography>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <Typography variant="h6" color="blue" className="mb-2">
                  Risk Assessment
                </Typography>
                <Typography variant="small" color="gray">
                  Our system will perform a risk assessment on your business revenue
                </Typography>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LightBulbIcon className="w-6 h-6 text-purple-600" />
                </div>
                <Typography variant="h6" color="purple" className="mb-2">
                  Smart Matching
                </Typography>
                <Typography variant="small" color="gray">
                  Our system matches you with the best investors for your business
                </Typography>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
