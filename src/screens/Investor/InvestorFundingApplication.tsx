import { FunnelIcon } from "@heroicons/react/24/solid";
import { Button, Card, CardBody, Spinner } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import { StatusBadge } from "../../components/StatusBadge";

export const InvestorFunding = (): JSX.Element => {
  const navigate = useNavigate();
  const [fundingApplication, setFundingApplication] = useState<any>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    await axios.get(`${API_BASE_URL}/investor/applications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response) => {
      setFundingApplication(response.data.data);
      setLoading(false);
    })
  }
  
  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner />
      </div>
    );
  }
  
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full max-w-[1512px] relative flex flex-col min-h-screen">
        {/* Left sidebar navigation */}
        <div className="fixed w-[311px] h-full left-0 top-0">
          <Sidenav active="application" />
        </div>

        {/* Main content area */}
        <div className="ml-[200px] flex flex-col flex-1">
          <div className="flex justify-between items-center px-8 py-6">
            <h1 className="text-3xl font-medium text-black font-text-3xl-font-medium ml-24">
              Funding Application
            </h1>
          </div>

          {/* Main content section */}
          <div className="flex-1 mt-10 w-full">
            {/* No Applications Card */}
            {fundingApplication && fundingApplication.length === 0 ? (
            <Card className="w-[948px] h-[152px] absolute top-[185px] left-[443px] rounded-[10px] border border-solid border-[#574964c7]">
            <CardBody className="flex items-center justify-center h-full p-0">
              <div className="font-text-xl-font-normal font-[400] text-gray-600 text-[20px] text-center tracking-[0px] leading-[150%] whitespace-nowrap [font-style: normal]">
                No applications found — it looks like you haven&apos;t applied
                for funding yet.
              </div>
            </CardBody>
          </Card>
            ) : (
            <div className="w-full max-w-[943px] ml-[150px]">
              <table className="table-borderless w-full">
                <thead className="border-b border-gray-300">
                  <tr>
                    <th className="[font-family:'Roboto',Helvetica] font-bold text-light-purple text-[15px] tracking-[0] leading-[21px] whitespace-nowrap text-left">
                      No.
                    </th>
                    <th className="[font-family:'Roboto',Helvetica] font-bold text-light-purple text-[15px] tracking-[0] leading-[21px] whitespace-nowrap text-left pl-12">
                      Application
                    </th>
                    <th className="w-[200px]"></th>
                    <th className="[font-family:'Roboto',Helvetica] font-bold text-light-purple text-[15px] tracking-[0] leading-[21px] whitespace-nowrap text-left">
                      Datetime
                    </th>
                    <th>
                      <div className="flex items-center gap-2">
                        <FunnelIcon className="w-[15px] h-[15px] text-light-purple" />
                        <span className="[font-family:'Roboto',Helvetica] font-bold text-light-purple text-[15px] tracking-[0] leading-[21px] whitespace-nowrap">
                          Status
                        </span>
                      </div>
                    </th>
                    <th className="[font-family:'Roboto',Helvetica] font-bold text-light-purple text-[15px] tracking-[0] leading-[21px] whitespace-nowrap text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(fundingApplication || []).map((application: any, idx: number) => (
                    <tr key={application.id} className="border-b border-gray-300">
                      <td className="[font-family:'Roboto',Helvetica] font-bold text-light-purple text-sm tracking-[0] leading-[19.6px] whitespace-nowrap py-4">
                        {idx + 1}
                      </td>
                      <td className="[font-family:'Roboto',Helvetica] font-bold text-light-purple text-sm tracking-[0] leading-[19.6px] whitespace-nowrap pl-12">
                        {application.startup_name}
                      </td>
                      <th className="w-[200px]"></th>
                      <td className="[font-family:'Roboto',Helvetica] font-normal text-light-purple text-sm tracking-[0] leading-[19.6px] whitespace-nowrap">
                        {application.date}
                      </td>
                      <td>
                        <StatusBadge status={application.status} />
                      </td>

                      <td className="text-center">
                        <Button
                          variant="outlined"
                          className="h-8 px-[5px] py-1.5 rounded-[5px] border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm tracking-[0] leading-[21px] capitalize"
                          onClick={() =>
                            navigate(`/application/${application.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}            
          </div>
        </div>
      </div>
    </div>
  );
};
