import { Button, Card, CardBody, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";

export const SelectInvestor = (): JSX.Element => {
  const [selectedInvestorIndex, setSelectedInvestorIndex] = useState<number | null>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidenavOpen");
    return saved === null ? true : saved === "true";
  });
  const location = useLocation();
  const investorMatches = location.state?.investorMatches || [];
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const applicationId = location.state?.applicationId;

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("sidenavOpen");
      setSidebarOpen(saved === null ? true : saved === "true");
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events if needed
    const handleSidebarToggle = () => {
      handleStorageChange();
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Poll for sidebar state changes (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("sidenavOpen");
      const currentState = saved === null ? true : saved === "true";
      if (currentState !== sidebarOpen) {
        setSidebarOpen(currentState);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchInvestors = async () => {
      if (investorMatches.length === 0) { setLoading(false); return; }
      const tempInvestorList = [];
      for (const investor of investorMatches) {
        try{
          const response = await axios.get(`${API_BASE_URL}/investor/${investor.investor}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          tempInvestorList.push(response.data.data);
        } catch (error) {
          console.error(error);
        }
      }
      setInvestors(tempInvestorList);
      setLoading(false);
    };
    fetchInvestors();
  }, [investorMatches, API_BASE_URL]);

  const sendSelectedInvestor = async (investorId: string) => {
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
    }
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
      {loading ? (
        <div className={`${sidebarOpen ? 'ml-64' : 'ml-40'} max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 justify-center items-center min-h-screen transition-all duration-300`}>
          <Spinner />
        </div>
      ) : (
        <div className={`${sidebarOpen ? 'ml-64' : 'ml-40'} max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 transition-all duration-300`}>
          <div className="p-6 max-md:p-4 max-sm:p-3 flex flex-col items-start max-w-2xl">
            <div className="max-w-lg max-md:max-w-md max-sm:max-w-sm mx-auto mt-4 max-md:mt-2 max-sm:mt-1">
              <Typography variant="h4" className="font-medium text-black mb-2 max-md:mb-1 max-sm:mb-1 text-3xl max-md:text-2xl max-sm:text-xl">
                Recommended Investors
              </Typography>

              <Typography
                variant="h6"
                className="text-gray-600 font-normal mb-6 max-md:mb-4 max-sm:mb-3 text-base max-md:text-sm max-sm:text-sm"
              >
                Congratulations! We have found some investors that fit your
                funding requirements. You can proceed to send your application to
                any of them.
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
                              className="text-gray-600 font-normal text-sm max-md:text-xs max-sm:text-xs"
                            >
                              Preferred funding stage: {investor?.investment_preferences.preferred_funding_stage.join(", ")}
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal text-sm max-md:text-xs max-sm:text-xs"
                            >
                              Preferred industry: {investor?.investment_preferences.preferred_industry.join(", ")}
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal text-sm max-md:text-xs max-sm:text-xs"
                            >
                              Revenue share percentage: {investor?.investment_preferences.revenue_share_percentage}%
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

              <div>
                <Button
                  className="bg-dark-plum hover:bg-light-purple text-white font-bold text-sm max-md:text-xs rounded-lg px-8 py-4 max-sm:py-3 capitalize"
                  onClick={() => {
                    selectedInvestorIndex !== null && sendSelectedInvestor(investors[selectedInvestorIndex].id);
                  }}
                  disabled={selectedInvestorIndex === null}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
    )}
    </div>
  );
};
