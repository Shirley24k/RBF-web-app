import { Alert, Button, Spinner, Typography } from "@material-tailwind/react";
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
  const [isLoading, setIsLoading] = useState(false);
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

  const handleTopUp = async () => {
    axios.post(`${API_BASE_URL}/investor/top-up`, {
      amount: topUpAmount,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response) => {
      setShowTopUpModal(false);
      setTopUpAmount("");
      window.location.href = response.data.checkout_url;
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const getBalance = async () => {
    axios.get(`${API_BASE_URL}/investor/balance`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response) => {
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
    const fetchData = async () => {
      setIsLoading(true);
      await getBalance();
      await fetchApplications();
      setIsLoading(false);
    }
    fetchData();
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0 z-20">
        <Sidenav active="transactions" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden z-20">
        <Sidenav active="transactions" />
      </div>

      {/* Main Content */}
      <main className="ml-16 transition-all duration-300 w-full">
        <div className="px-6 py-8 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-16 max-lg:mb-12 max-sm:mb-8">
              <div className="flex flex-row justify-between items-center">
                <div>
                  <Typography variant="h4" className="text-4xl max-lg:text-3xl max-sm:text-2xl font-bold text-gray-900 mb-6 max-lg:mb-4 max-sm:mb-3">
                    Transaction History
                  </Typography>
                  <Typography variant="paragraph" className="text-xl max-lg:text-base max-sm:text-sm text-gray-600 max-w-2xl">
                    Track your investment transactions and payments
                  </Typography>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Typography variant="h5" className="text-lg max-sm:text-sm font-semibold text-gray-900">
                    Balance: RM {balance.toFixed(2)}
                  </Typography>
                  <Button
                    className="bg-dark-plum hover:bg-light-purple text-white px-4 py-2 max-md:px-3 max-sm:p-2 rounded-md font-bold text-sm max-sm:text-xs capitalize"
                    onClick={() => setShowTopUpModal(true)}
                  >
                    Top Up
                  </Button>
                </div>
              </div>
            </div>

        {/* Top Up Modal */}
        {showTopUpModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 max-md:p-6 max-sm:p-4 w-full max-w-xs max-md:max-w-sm max-sm:max-w-xs">
              <Typography variant="h5" className="text-lg max-md:text-xl max-sm:text-lg font-bold mb-4">Top Up Amount</Typography>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-dark-plum text-sm max-md:text-base max-sm:text-sm"
                placeholder="Enter amount (RM)"
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value)}
              />
              {/* Fee Breakdown */}
              {topUpAmount && Number(topUpAmount) > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Typography variant="small" className="text-gray-600 font-medium mb-2 text-xs">
                    Fee Breakdown
                  </Typography>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Top-up Amount:</span>
                      <span className="font-medium">RM {Number(topUpAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee (4% + RM 1):</span>
                      <span className="font-medium">RM {((Number(topUpAmount) + 1) / 0.96 - Number(topUpAmount)).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-1 mt-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-dark-plum">Total Amount Charged:</span>
                        <span className="text-dark-plum">RM {((Number(topUpAmount) + 1) / 0.96).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* No Transactions State */}
              {applications && applications.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Typography variant="paragraph" className="text-lg text-gray-500 mb-2">
                      No transactions found
                    </Typography>
                    <Typography variant="small" className="text-gray-400">
                      No transaction history available
                    </Typography>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">
                              Transaction ID
                            </Typography>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">
                              Startup
                            </Typography>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">
                              Date
                            </Typography>
                          </th>
                          <th className="px-6 py-4 text-center">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">
                              Status
                            </Typography>
                          </th>
                          <th className="px-6 py-4 text-center">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">
                              Actions
                            </Typography>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(applications || []).map((application: any, index: number) => (
                          <tr 
                            key={application.id} 
                            className={`hover:bg-gray-50 transition-colors duration-150 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Typography variant="small" className="font-semibold text-gray-900">
                                #{application.id}
                              </Typography>
                            </td>
                            <td className="px-6 py-4">
                              <Typography variant="small" className="text-gray-900">
                                {application.startup_name}
                              </Typography>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Typography variant="small" className="text-gray-500">
                                {application.date}
                              </Typography>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <StatusBadge status={application.status} />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Button
                                variant="outlined"
                                size="sm"
                                className="border-dark-plum text-dark-plum hover:bg-dark-plum hover:text-white transition-all duration-200 font-medium capitalize"
                                onClick={() => navigate(`/application-transaction-details/${application.id}`)}
                              >
                                View Transaction
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tablet View (md to lg) */}
                  <div className="hidden md:block lg:hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">
                              Transaction Details
                            </Typography>
                          </th>
                          <th className="px-4 py-3 text-center">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">
                              Status
                            </Typography>
                          </th>
                          <th className="px-4 py-3 text-center">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">
                              Actions
                            </Typography>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(applications || []).map((application: any, index: number) => (
                          <tr 
                            key={application.id} 
                            className={`hover:bg-gray-50 transition-colors duration-150 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                          >
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <Typography variant="small" className="font-bold text-gray-900 text-sm">
                                  #{application.id}
                                </Typography>
                                <Typography variant="small" className="text-gray-900 text-sm">
                                  Startup: {application.startup_name}
                                </Typography>
                                <Typography variant="small" className="text-gray-500 text-sm">
                                  Date: {application.date}
                                </Typography>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <StatusBadge status={application.status} />
                            </td>
                            <td className="px-4 py-4 text-center">
                              <Button
                                variant="outlined"
                                size="sm"
                                className="border-dark-plum text-dark-plum hover:bg-dark-plum hover:text-white transition-all duration-200 font-medium text-xs px-3 py-1 capitalize"
                                onClick={() => navigate(`/application-transaction-details/${application.id}`)}
                              >
                                View Transaction
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View (below md) */}
                  <div className="md:hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">
                              Transaction Details
                            </Typography>
                          </th>
                          <th className="px-4 py-3 text-center">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">
                              Actions
                            </Typography>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(applications || []).map((application: any, index: number) => (
                          <tr 
                            key={application.id} 
                            className={`hover:bg-gray-50 transition-colors duration-150 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                          >
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <Typography variant="small" className="font-bold text-gray-900 text-sm">
                                  #{application.id}
                                </Typography>
                                <Typography variant="small" className="text-gray-900 text-xs">
                                  Startup: {application.startup_name}
                                </Typography>
                                <Typography variant="small" className="text-gray-500 text-xs">
                                  Date: {application.date}
                                </Typography>
                                <div className="pt-1">
                                  <StatusBadge status={application.status} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <Button
                                variant="outlined"
                                size="sm"
                                className="border-dark-plum text-dark-plum hover:bg-dark-plum hover:text-white transition-all duration-200 font-medium text-xs px-3 py-1 capitalize"
                                onClick={() => navigate(`/application-transaction-details/${application.id}`)}
                              >
                                View Transaction
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

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
  );
};
