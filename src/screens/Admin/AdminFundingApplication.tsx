import { FunnelIcon } from "@heroicons/react/24/solid";
import { Button, Card, CardBody, Spinner } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import { StatusBadge } from "../../components/StatusBadge";

export const AdminFunding = (): JSX.Element => {
  const navigate = useNavigate();
  const [fundingApplication, setFundingApplication] = useState<any>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    await axios.get(`${API_BASE_URL}/applications`, {
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
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="application" />
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="application" />
      </div>
      <div className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1">
        <div className="flex flex-row justify-between items-center py-6 max-md:py-4 w-full max-w-2xl md:max-w-3xl mx-auto">
          <h1 className="text-3xl max-md:text-2xl max-sm:text-lg font-medium text-black font-text-3xl-font-medium">
            Funding Application
          </h1>
        </div>

        {/* Main content section */}
        <div className="mt-10 max-md:mt-6 max-sm:mt-4 w-full">
          {/* No Applications Card */}
          {fundingApplication && fundingApplication.length === 0 ? (
            <div className="flex justify-center">
              <Card className="w-full max-w-xl sm:max-w-2xl h-auto rounded-[10px] border border-solid border-[#574964c7]">
                <CardBody className="flex items-center justify-center h-full p-4">
                  <div className="font-text-xl-font-normal font-[400] text-gray-600 text-base sm:text-lg md:text-[20px] text-center tracking-[0px] leading-[150%] whitespace-normal [font-style: normal]">
                    No applications found — it looks like you haven&apos;t applied for funding yet.
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : (
            <div className="w-full max-w-2xl md:max-w-4xl mx-auto">
              {/* Desktop/Tablet Table View */}
              <div className="hidden md:block">
                <table className="w-full table-auto text-left">
                  <thead className="border-b border-gray-300">
                    <tr>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-left">
                        ID
                      </th>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-left pl-6 max-md:pl-4">
                        Startup
                      </th>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-left pl-6 max-md:pl-4">
                        Investor
                      </th>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-left">
                        Datetime
                      </th>
                      <th>
                        <div className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-center">
                          Status
                        </div>
                      </th>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fundingApplication || []).map((application: any, idx: number) => (
                      <tr key={application.id} className="border-b border-gray-300">
                        <td className="font-bold text-light-purple text-sm max-md:text-sm tracking-[0] leading-[19.6px] whitespace-nowrap py-4 max-md:py-3">
                          {application.id}
                        </td>
                        <td className="font-bold text-light-purple text-sm max-md:text-sm tracking-[0] leading-[19.6px] whitespace-nowrap pl-6 max-md:pl-4">
                          {application.startup_name}
                        </td>
                        <td className="font-bold text-light-purple text-sm max-md:text-sm tracking-[0] leading-[19.6px] whitespace-nowrap pl-6 max-md:pl-4">
                          {application.investor_name}
                        </td>
                        <td className="font-normal text-light-purple text-sm max-md:text-sm tracking-[0] leading-[19.6px] whitespace-nowrap">
                          {application.date}
                        </td>
                        <td>
                          <StatusBadge status={application.status} />
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outlined"
                            className="h-8 max-md:h-7 px-4 max-md:px-3 py-1.5 rounded-[5px] border border-solid border-light-purple font-bold text-dark-plum text-sm max-md:text-xs tracking-[0] leading-[21px] capitalize"
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 mb-4">
                {(fundingApplication || []).map((application: any, idx: number) => (
                  <Card key={application.id} className="w-full border border-gray-200 rounded-sm">
                    <CardBody className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-light-purple text-sm">#{application.id}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Startup: {application.startup_name}
                        <br />
                        Investor: {application.investor_name}
                        <br />
                        Status: <StatusBadge status={application.status} />
                        <br />
                        Date: {application.date}
                        <br />
                      </div>
                    </CardBody>
                    
                    {/* Card Footer Button */}
                    <div className="border-t border-gray-200">
                      <Button
                        variant="text"
                        className="bg-light-purple w-full h-12 rounded-b-sm rounded-t-none border-0 border-t border-light-purple font-bold text-white text-sm tracking-[0] leading-[21px] capitalize"
                        onClick={() =>
                          navigate(`/application/${application.id}`)
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div> 
          )}
        </div>
      </div>
    </div>
  );
};
