import { Button, Typography } from "@material-tailwind/react";
import { Card, CardBody } from "@material-tailwind/react";
import { Sidenav } from "../../components/sidenav";
import { useState } from "react";

export const SelectInvestor = (): JSX.Element => {
  const [selectedInvestorIndex, setSelectedInvestorIndex] = useState<number | null>(null);
  
  const investors = [
    {
      name: "FundBhd",
      investmentRange: "RM20000 - 50000",
      repaymentMultiple: "1.5x",
      revenueSharePercentage: "5%",
    },
    {
      name: "John Tan",
      investmentRange: "RM20000 - 50000",
      repaymentMultiple: "1.5x",
      revenueSharePercentage: "5%",
    },
    {
      name: "InvestCo",
      investmentRange: "RM20000 - 50000",
      repaymentMultiple: "1.5x",
      revenueSharePercentage: "5%",
    },
  ];

  return (
    <div className="bg-white flex h-screen">
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>

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
                  key={investor.name}
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
                          {investor.name}
                        </Typography>
                        <div>
                          <Typography
                            variant="h6"
                            className="text-gray-600 font-normal"
                          >
                            Investment amount range: {investor.investmentRange}
                          </Typography>
                          <Typography
                            variant="h6"
                            className="text-gray-600 font-normal"
                          >
                            Repayment multiple: {investor.repaymentMultiple}
                          </Typography>
                          <Typography
                            variant="h6"
                            className="text-gray-600 font-normal"
                          >
                            Revenue share percentage:{" "}
                            {investor.revenueSharePercentage}
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
                  window.location.href = "/success-submit-funding";
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
