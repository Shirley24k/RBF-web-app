import { Button, Card, CardBody, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";

export const SelectInvestor = (): JSX.Element => {
  const [selectedInvestorIndex, setSelectedInvestorIndex] = useState<number | null>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();
  const investorMatches = location.state?.investorMatches || [];
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const applicationId = location.state?.applicationId;
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
    <div className="bg-white flex h-screen">
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>
      {loading ? (
        <div className="ml-[200px] flex flex-col flex-1 justify-center items-center h-screen">
          <Spinner />
        </div>
      ) : (
        <div className="ml-[200px] flex flex-col flex-1 ">
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-[1014px] mx-auto mt-8">
              <Typography variant="h4" className="font-medium text-black mb-4">
                Recommended Investors
              </Typography>

              <Typography
                variant="h6"
                className="text-gray-600 font-normal mb-12"
              >
                Congratulations! We have found some investors that fit your
                funding requirements. You can proceed to send your application to
                any of them.
              </Typography>

              <div className="space-y-6 mb-12">
                {investors.map((investor, index) => (
                  <Card
                    key={investor.id}
                    className={`w-[650px] shadow-shadow-lg bg-warm-off-white transition-all duration-200 ${
                      selectedInvestorIndex === index
                        ? "border-2 border-dark-plum"
                        : "border border-none"
                    }`}
                  >
                    <CardBody className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="space-y-3">
                          <Typography
                            variant="h3"
                            className="text-xl font-normal text-black tracking-[-0.40px] font-['Lora']"
                          >
                            {investor?.name}
                          </Typography>
                          <div>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal"
                            >
                              Investment amount range: {investor?.investment_preferences.investment_amount_range}
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal"
                            >
                              Preferred funding stage: {investor?.investment_preferences.preferred_funding_stage.join(", ")}
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal"
                            >
                              Preferred industry: {investor?.investment_preferences.preferred_industry.join(", ")}
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-gray-600 font-normal"
                            >
                              Revenue share percentage: {investor?.investment_preferences.revenue_share_percentage}%
                            </Typography>
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedInvestorIndex(index)}
                          className={`px-6 py-3 capitalize font-bold rounded-lg ${
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
                  className="bg-dark-plum hover:bg-light-purple text-white font-bold text-sm rounded-lg px-8 py-4 capitalize"
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
