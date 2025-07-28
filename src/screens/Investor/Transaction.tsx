import { FunnelIcon } from "@heroicons/react/24/solid";
import { Alert, Button, Typography } from "@material-tailwind/react";
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

  useEffect(() => {
    fetchApplications()
  }, [])

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
    getBalance();
  }, [])

  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="transactions" />
      </div>

      {/* Main Content */}
      <div className="ml-[255px] p-10 w-full overflow-auto">
        <div className="space-y-6 max-w-[1200px] ml-[20px]">
          <div className="flex justify-between">
            <div className="px-4 py-8 mx-10">
              <Typography variant="h4" color="blue-gray">
                Transaction History
              </Typography>
            </div>
            <div className="flex items-center mx-20 gap-x-5">
              <Typography variant="h5" color="blue-gray">
                Balance: RM {balance.toFixed(2)}
              </Typography>
              <button
                className="bg-dark-plum text-white px-4 py-2 rounded-md hover:bg-light-purple font-bold cursor-pointer"
                onClick={() => setShowTopUpModal(true)}
              >
                Top Up
              </button>
            </div>
          </div>

          {/* Top Up Modal */}
          {showTopUpModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Top Up Amount</h2>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-dark-plum"
                  placeholder="Enter amount (RM)"
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-md bg-white border border-light-purple text-dark-plum cursor-pointer hover:text-light-purple"
                    onClick={() => setShowTopUpModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-dark-plum text-white hover:bg-light-purple cursor-pointer"
                    onClick={handleTopUp}
                    disabled={!topUpAmount || Number(topUpAmount) <= 0}
                  >
                    Top Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <table className="w-[90%] table-auto text-left mx-10">
            <thead>
              <tr className="text-gray-600 border-b border-gray-300">
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Datetime</th>
                <th className="px-4 py-3 flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4" /> Status
                </th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {applications && applications.map((application: any) => (
                <tr key={application.id} className="border-b border-gray-300">
                  <td className="px-4 py-3">{application.id}</td>
                  <td className="px-4 py-3">{application.startup_name}</td>
                  <td className="px-4 py-3">{application.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={application.status}></StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outlined"
                      className="border-dark-plum border-2 capitalize text-sm font-bold text-dark-plum"
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

          {snackbarMessage && (
            <div className="mx-auto mt-8 flex items-center justify-center fixed bottom-10 left-0 right-0">
              {/* Alert at the bottom */}
              <Alert
                open={snackbarMessage !== ""}
                variant="ghost"
                color="gray"
                onClose={() => setSnackbarMessage("")}
                className="w-fit rounded-lg border-none flex items-center justify-between px-3 py-4 font-medium"
              >
                {snackbarMessage}
              </Alert>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
