import { FunnelIcon } from "@heroicons/react/24/solid";
import { Alert, Button, Card, CardBody, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import { StatusBadge } from "../../components/StatusBadge";

export const InvestorTransaction = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const session_id = searchParams.get('session_id');
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  //fetch active and completed applications
  const fetchApplications = async () => {
    await axios.get(`${API_BASE_URL}/investor/transaction-applications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response) => {
      setApplications(response.data.data)
      console.log('Applications', response.data.data)
    })
  }

  const handleTopUp = () => {
    axios.post(`${API_BASE_URL}/investor/top-up`, {
      amount: topUpAmount,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response) => {
      console.log(response.data);
      setShowTopUpModal(false);
      setTopUpAmount("");
      window.location.href = response.data.checkout_url;
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const getBalance = () => {
    axios.get(`${API_BASE_URL}/investor/balance`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response) => {
      console.log(response.data);
      setBalance(Number(response.data.data));
    })
    .catch((error) => {
      console.log(error);
    });
  }

  useEffect(()=>{
    if(status === "success" && session_id){
      setSnackbarMessage('Top up successful!');
    }else if(status === 'cancelled'){
      setSnackbarMessage('Top up was cancelled');
    }
  }, [status])

  useEffect(()=>{
    fetchApplications();
    getBalance();
  }, [])

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="transactions" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="transactions" />
      </div>

      {/* Main Content */}
      <div className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1">
        <div className="flex flex-row justify-between items-center py-6 max-md:py-4 w-full max-w-2xl md:max-w-3xl mx-auto">
          <h1 className="text-3xl max-md:text-2xl max-sm:text-base font-medium text-black w-fit">
            Transaction History
          </h1>
          <div className="flex flex-col gap-1">
            <Typography variant="h5" className="text-lg max-md:text-xl max-sm:text-sm max-sm:font-light">
              Balance: RM {balance.toFixed(2)}
            </Typography>
            <button
              className="bg-dark-plum text-white px-3 max-md:px-4 max-sm:px-3 py-2 rounded-md hover:bg-light-purple font-bold cursor-pointer text-sm"
              onClick={() => setShowTopUpModal(true)}
            >
              Top Up
            </button>
          </div>
        </div>

        {/* Top Up Modal */}
        {showTopUpModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 max-md:p-6 max-sm:p-4 w-full max-w-xs max-md:max-w-sm max-sm:max-w-xs">
              <h2 className="text-lg max-md:text-xl max-sm:text-lg font-bold mb-4">Top Up Amount</h2>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-dark-plum text-sm max-md:text-base max-sm:text-sm"
                placeholder="Enter amount (RM)"
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  className="px-3 max-md:px-4 max-sm:px-3 py-2 rounded-md bg-white border border-light-purple text-dark-plum cursor-pointer hover:text-light-purple text-sm max-md:text-base max-sm:text-sm"
                  onClick={() => setShowTopUpModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 max-md:px-4 max-sm:px-3 py-2 rounded-md bg-dark-plum text-white hover:bg-light-purple cursor-pointer text-sm max-md:text-base max-sm:text-sm"
                  onClick={handleTopUp}
                  disabled={!topUpAmount || Number(topUpAmount) <= 0}
                >
                  Top Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content section */}
        <div className="mt-10 max-md:mt-6 max-sm:mt-4 w-full">
          {applications && applications.length === 0 ? (
            <div className="flex justify-center">
              <div className="text-center text-gray-600 text-lg max-md:text-base">
                No transactions found.
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl md:max-w-3xl mx-auto">
              {/* Desktop/Tablet Table View */}
              <div className="hidden md:block">
                <table className="w-full table-auto text-left">
                  <thead className="border-b border-gray-300">
                    <tr>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-left">
                        No.
                      </th>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-left pl-6 max-md:pl-4">
                        Startup
                      </th>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-left">
                        Datetime
                      </th>
                      <th>
                        <div className="flex items-center gap-2">
                          <FunnelIcon className="w-4 h-4 max-md:w-3 max-md:h-3 text-light-purple" />
                          <span className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap">
                            Status
                          </span>
                        </div>
                      </th>
                      <th className="font-bold text-light-purple text-base max-md:text-sm tracking-[0] leading-[21px] whitespace-nowrap text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(applications || []).map((application: any) => (
                      <tr key={application.id} className="border-b border-gray-300">
                        <td className="font-bold text-light-purple text-sm max-md:text-sm tracking-[0] leading-[19.6px] whitespace-nowrap py-4 max-md:py-3">
                          {application.id}
                        </td>
                        <td className="font-bold text-light-purple text-sm max-md:text-sm tracking-[0] leading-[19.6px] whitespace-nowrap pl-6 max-md:pl-4">
                          {application.startup_name}
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
                            onClick={() => {
                              navigate(`/application-transaction-details/${application.id}`);
                            }}
                          >
                            View Transaction
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 mb-4">
                {(applications || []).map((application: any) => (
                  <Card key={application.id} className="w-full border border-gray-200 rounded-sm">
                    <CardBody className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-light-purple text-sm">ID: #{application.id}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Application: {application.startup_name}
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
                        onClick={() => {
                          navigate(`/application-transaction-details/${application.id}`);
                        }}
                      >
                        View Transaction
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {snackbarMessage && (
          <div className="mx-auto mt-4 max-md:mt-8 flex items-center justify-center fixed bottom-4 max-md:bottom-10 left-0 right-0 px-4">
            {/* Alert at the bottom */}
            <Alert
              open={snackbarMessage !== ""}
              variant="ghost"
              color="gray"
              onClose={() => setSnackbarMessage("")}
              className="w-fit rounded-lg border-none flex items-center justify-between px-3 font-medium text-sm max-md:text-base"
            >
              {snackbarMessage}
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};
