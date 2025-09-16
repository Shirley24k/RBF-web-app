import { Alert, Dialog, DialogBody, DialogFooter, DialogHeader, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApplicationsTable, { ApplicationsTableColumn } from "../../components/ApplicationsTable";
import AppButton from "../../components/ui/AppButton";
import { Sidenav } from "../../components/ui/sidenav";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Lottie from "lottie-react";
import coinCirclingWallet from "../../assets/coin circling wallet.json";

export const InvestorTransaction = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const session_id = searchParams.get('session_id');
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
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
      await getBalance();
      await fetchApplications();
      setLoading(false);
    }
    fetchData();
  }, [])

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
                  <AppButton
                    variant="primary"
                    size="md"
                    onClick={() => setShowTopUpModal(true)}
                  >
                    Top Up
                  </AppButton>
                </div>
              </div>
            </div>

            <ApplicationsTable
              rows={applications || []}
              keyFor={(app: any) => app.id}
              columns={[
                { id: 'id', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">Transaction ID</Typography>) },
                { id: 'startup', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">Startup</Typography>) },
                { id: 'date', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">Date</Typography>) },
                { id: 'status', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">Status</Typography>), align: 'center' },
                { id: 'actions', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">Actions</Typography>), align: 'center' },
              ] as ApplicationsTableColumn[]}
              renderCell={(app: any, columnId: string) => {
                switch (columnId) {
                  case 'id':
                    return (<Typography variant="small" className="font-semibold text-gray-900">#{app.id}</Typography>);
                  case 'startup':
                    return (<Typography variant="small" className="text-gray-900">{app.startup_name}</Typography>);
                  case 'date':
                    return (<Typography variant="small" className="text-gray-500">{app.date}</Typography>);
                  case 'status':
                    return (<StatusBadge status={app.status} />);
                  case 'actions':
                    return (
                      <AppButton variant="outline" size="sm" onClick={() => navigate(`/application-transaction-details/${app.id}`)}>
                        View Transaction
                      </AppButton>
                    );
                  default:
                    return null;
                }
              }}
              tabletColumns={[
                { id: 'details', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Transaction Details</Typography>) },
                { id: 'status', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Status</Typography>), align: 'center' },
                { id: 'actions', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Actions</Typography>), align: 'center' },
              ] as ApplicationsTableColumn[]}
              renderTabletCell={(app: any, columnId: string) => {
                switch (columnId) {
                  case 'details':
                    return (
                      <div className="space-y-2">
                        <Typography variant="small" className="font-bold text-gray-900 text-sm">#{app.id}</Typography>
                        <Typography variant="small" className="text-gray-900 text-sm">Startup: {app.startup_name}</Typography>
                        <Typography variant="small" className="text-gray-500 text-sm">Date: {app.date}</Typography>
                      </div>
                    );
                  case 'status':
                    return (<StatusBadge status={app.status} />);
                  case 'actions':
                    return (
                      <AppButton variant="outline" size="sm" onClick={() => navigate(`/application-transaction-details/${app.id}`)}>
                        View Transaction
                      </AppButton>
                    );
                  default:
                    return null;
                }
              }}
              mobileColumns={[
                { id: 'details', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Transaction Details</Typography>) },
                { id: 'actions', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Actions</Typography>), align: 'center' },
              ] as ApplicationsTableColumn[]}
              renderMobileCell={(app: any, columnId: string) => {
                switch (columnId) {
                  case 'details':
                    return (
                      <div className="space-y-2">
                        <Typography variant="small" className="font-bold text-gray-900 text-sm">#{app.id}</Typography>
                        <Typography variant="small" className="text-gray-900 text-xs">Startup: {app.startup_name}</Typography>
                        <Typography variant="small" className="text-gray-500 text-xs">Date: {app.date}</Typography>
                        <div className="pt-1">
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    );
                  case 'actions':
                    return (
                      <AppButton variant="outline" size="sm" onClick={() => navigate(`/application-transaction-details/${app.id}`)}>
                        View Transaction
                      </AppButton>
                    );
                  default:
                    return null;
                }
              }}
              emptyState={(
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Typography variant="paragraph" className="text-lg text-gray-500 mb-2">No transactions found</Typography>
                    <Typography variant="small" className="text-gray-400">No transaction history available</Typography>
                  </div>
                </div>
              )}
            />
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

        {/* Top Up Modal */}
        <Dialog open={showTopUpModal} handler={() => setShowTopUpModal(false)} size="xs" className="rounded-2xl">
          <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
            <Typography variant="h4" color="white" className="font-bold">
              Top Up Amount
            </Typography>
          </DialogHeader>
          <DialogBody className="p-8 max-h-[70vh] overflow-y-auto bg-beige">
            <div className="space-y-4">
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-plum text-sm max-md:text-base max-sm:text-sm"
                placeholder="Enter amount (RM)"
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value)}
              />
              {/* Fee Breakdown */}
              {topUpAmount && Number(topUpAmount) > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
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
            </div>
          </DialogBody>
          <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl">
            <div className="flex flex-row gap-4 max-lg:gap-3 max-sm:gap-2 w-full justify-end">
              <AppButton
                variant="outline"
                size="md"
                onClick={() => setShowTopUpModal(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                variant="primary"
                size="md"
                onClick={handleTopUp}
                disabled={!topUpAmount || Number(topUpAmount) <= 0}
              >
                Top Up
              </AppButton>
            </div>
          </DialogFooter>
        </Dialog>
    </div>
  );
};
