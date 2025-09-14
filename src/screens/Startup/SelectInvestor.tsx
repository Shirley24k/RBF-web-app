import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody, Dialog, DialogBody, DialogFooter, DialogHeader, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import { getIndustryLabel } from "../../utils/industryOptions";

export const SelectInvestor = (): JSX.Element => {
  const [selectedInvestorIndex, setSelectedInvestorIndex] = useState<number | null>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [allInvestorMatches, setAllInvestorMatches] = useState<any[]>([]);

  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const location = useLocation();
  const investorMatches = location.state?.investorMatches || [];
  const hasGoodMatches = location.state?.hasGoodMatches;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const applicationId = location.state?.applicationId;

  const getFundingStageLabel = (value: string): string => {
    return value.replace(/_/g, ' ')
  };

  useEffect(() => {
    const fetchInvestors = async () => {
      if (investorMatches.length === 0) { setLoading(false); return; }
      
      try {
        // Store all investor matches for pagination
        setAllInvestorMatches(investorMatches);
        
        // Calculate total pages based on all available matches
        const totalPages = Math.ceil(investorMatches.length / 3);
        setTotalPages(totalPages);
        
        // Get first page of investors (first 3)
        const firstPageInvestors = investorMatches.slice(0, 3);
        
        const tempInvestorList: any[] = [];
        for (const investor of firstPageInvestors) {
          try{
            const response = await axios.get(`${API_BASE_URL}/investor/${investor.investor}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            tempInvestorList.push({
              ...response.data.data,
              score: investor.score,
              sector_investments: investor.sector_investments,
              tag_overlap_count: investor.tag_overlap_count
            });
          } catch (error) {
            console.error(error);
          }
        }
        
        setInvestors(tempInvestorList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching investors:', error);
        setLoading(false);
      }
    };
    fetchInvestors();
  }, [investorMatches, hasGoodMatches, API_BASE_URL]);

  const sendSelectedInvestor = async (investorId: string) => {
    setIsSending(true);
    try {
      const response = await axios.patch(`${API_BASE_URL}/startup/select-investor/${applicationId}`, {
        investor_id: investorId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        window.location.href = "/success-submit-funding";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  }

  const handleViewDetails = (investor: any) => {
    setSelectedInvestor(investor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvestor(null);
  };

  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    setLoadingMore(true);
    setCurrentPage(page);
    
    try {
      // Calculate start and end indices for the requested page
      const startIndex = (page - 1) * 3;
      const endIndex = startIndex + 3;
      const pageInvestors = allInvestorMatches.slice(startIndex, endIndex);

      const tempInvestorList: any[] = [];
      for (const investor of pageInvestors) {
        try{
          const response = await axios.get(`${API_BASE_URL}/investor/${investor.investor}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          tempInvestorList.push({
            ...response.data.data,
            score: investor.score,
            sector_investments: investor.sector_investments,
            tag_overlap_count: investor.tag_overlap_count
          });
        } catch (error) {
          console.error(error);
        }
      }
      
      setInvestors(tempInvestorList);
      setSelectedInvestorIndex(null); // Reset selection when changing pages
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0 z-20">
        <Sidenav active="application" />
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="application" />
      </div>
      {loading ? (
        <div className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 justify-center items-center min-h-screen transition-all duration-300">
          <Spinner />
        </div>
      ) : (
        <div className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 transition-all duration-300">
          <div className="p-6 max-md:p-4 max-sm:p-3 flex flex-col items-start max-w-2xl">
            <div className="max-w-lg max-md:max-w-md max-sm:max-w-sm mx-auto mt-4 max-md:mt-2 max-sm:mt-1">
              <Typography variant="h4" className="font-medium text-black mb-2 max-md:mb-1 max-sm:mb-1 text-3xl max-md:text-2xl max-sm:text-xl">
                Recommended Investors
              </Typography>

              <Typography
                variant="h6"
                className="text-gray-600 font-normal mb-6 max-md:mb-4 max-sm:mb-3 text-base max-md:text-sm max-sm:text-sm"
              >
                {hasGoodMatches ? (
                  <>
                    Congratulations! We have found some investors that fit your
                    funding requirements. You can proceed to send your application to
                    any of them.
                  </>
                ) : (
                  <>
                    We couldn't find investors with perfect matches for your requirements.
                    However, here are some suggested investors who might be interested
                    in your business. You can still send your application to any of them.
                  </>
                )}
              </Typography>

              <div className="space-y-6 mb-12">
                {investors.map((investor, index) => (
                  <Card
                    key={investor.id}
                    className={`w-full shadow-shadow-lg bg-warm-off-white transition-all duration-200 ${
                      selectedInvestorIndex === index
                        ? "border-2 border-dark-plum"
                        : "border border-none"
                    }`}
                  >
                    <CardBody className="p-6 max-md:p-4 max-sm:p-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-md:gap-3 max-sm:gap-2">
                        <div className="space-y-2 max-md:space-y-1.5 max-sm:space-y-1 flex-1">
                          <Typography
                            variant="h3"
                            className="text-xl max-md:text-lg max-sm:text-base font-normal text-black tracking-[-0.40px] font-['Lora']"
                          >
                            {investor?.name}
                          </Typography>
                          <div className="space-y-1 max-md:space-y-1 max-sm:space-y-0.5">
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal text-sm max-md:text-xs max-sm:text-xs"
                            >
                              Investment amount range: {investor?.investment_preferences.investment_amount_range}
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal text-sm max-md:text-xs max-sm:text-xs capitalize"
                            >
                              Preferred funding stage: {investor?.investment_preferences.preferred_funding_stage.map(getFundingStageLabel).join(", ")}
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal text-sm max-md:text-xs max-sm:text-xs"
                            >
                              Preferred industry: {investor?.investment_preferences.preferred_industry.map(getIndustryLabel).join(", ")}
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal text-sm max-md:text-xs max-sm:text-xs"
                            >
                              Revenue share percentage: {investor?.investment_preferences.revenue_share_percentage}%
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-dark-plum underline font-semibold text-sm max-md:text-xs max-sm:text-xs cursor-pointer"
                              onClick={() => handleViewDetails(investor)}
                            >
                              View more details <ArrowRightIcon className="h-4 w-4 inline-block" />
                            </Typography>
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedInvestorIndex(index)}
                          className={`px-6 max-md:px-4 max-sm:px-3 py-3 max-md:py-2.5 max-sm:py-2 capitalize font-bold rounded-lg text-sm max-md:text-xs w-full sm:w-auto ${
                            selectedInvestorIndex === index
                              ? "bg-light-purple text-white"
                              : "bg-dark-plum text-white hover:bg-light-purple"
                          }`}
                        >
                          {selectedInvestorIndex === index ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mb-8 flex flex-col items-center gap-3">
                  {/* Page Info */}
                  <Typography variant="small" className="text-gray-600 text-sm">
                    Page {currentPage} of {totalPages}
                  </Typography>
                  
                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-2">
                  {/* Previous Button */}
                  <Button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1 || loadingMore}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm max-md:text-xs rounded-lg px-4 py-2 max-sm:py-1.5 capitalize"
                  >
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        disabled={loadingMore}
                        className={`font-bold text-sm max-md:text-xs rounded-lg px-3 py-2 max-sm:py-1.5 ${
                          currentPage === pageNum
                            ? 'bg-dark-plum text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <Button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || loadingMore}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm max-md:text-xs rounded-lg px-4 py-2 max-sm:py-1.5 capitalize"
                  >
                    More suggestions
                  </Button>

                    {/* Loading Indicator */}
                    {loadingMore && (
                      <div className="ml-2">
                        <Spinner className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Button
                  className="bg-dark-plum hover:bg-light-purple text-white font-bold text-sm max-md:text-xs rounded-lg px-8 py-4 max-sm:py-3 capitalize"
                  onClick={() => {
                    selectedInvestorIndex !== null && sendSelectedInvestor(investors[selectedInvestorIndex].id);
                  }}
                  disabled={selectedInvestorIndex === null || isSending}
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                    </span>
                  ) : (
                    'Send'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
    )}
    {/* Investor Details Modal */}
    <Dialog open={isModalOpen} handler={closeModal} size="lg" className="max-w-4xl">
      <DialogHeader className="bg-dark-plum text-white">
        <Typography variant="h4" className="text-white">
          Investor Profile: {selectedInvestor?.name}
        </Typography>
      </DialogHeader>
      <DialogBody className="p-6">
        {selectedInvestor && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-warm-off-white p-4 rounded-lg">
              <Typography variant="h5" className="text-dark-plum mb-3 font-semibold">
                Basic Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    Name
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    {selectedInvestor?.name || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    Phone Number
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    {selectedInvestor?.contact_no || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    {selectedInvestor?.type === "individual" ? "Country" : "Company Address"}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    {selectedInvestor?.type === "individual" 
                      ? (selectedInvestor?.country || "N/A")
                      : (selectedInvestor?.company_address || "N/A")
                    }
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    Type
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    {selectedInvestor?.type === "individual" ? "Individual Investor" : "Investment Firm"}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Investment Preferences */}
            <div className="bg-warm-off-white p-4 rounded-lg">
              <Typography variant="h5" className="text-dark-plum mb-3 font-semibold">
                Investment Preferences
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    Investment Amount Range
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    {selectedInvestor?.investment_preferences?.investment_amount_range || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    Preferred Funding Stage
                  </Typography>
                  <Typography variant="paragraph" className="text-black capitalize">
                    {selectedInvestor?.investment_preferences?.preferred_funding_stage?.map(getFundingStageLabel).join(", ") || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    Preferred Industry
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    {selectedInvestor?.investment_preferences?.preferred_industry?.map(getIndustryLabel).join(", ") || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    Revenue Share Percentage
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    {selectedInvestor?.investment_preferences?.revenue_share_percentage || "N/A"}%
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogBody>
      <DialogFooter className="bg-gray-50">
        <Button
          variant="text"
          onClick={closeModal}
          className="mr-2 bg-dark-plum hover:bg-light-purple text-white font-bold text-sm max-md:text-xs rounded-lg px-8 py-4 max-sm:py-3 capitalize"
        >
          Close
        </Button>
      </DialogFooter>
    </Dialog>
    </div>
  );
};
