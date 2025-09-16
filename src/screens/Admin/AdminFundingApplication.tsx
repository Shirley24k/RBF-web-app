import { Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ApplicationsTable, { ApplicationsTableColumn } from "../../components/ApplicationsTable";
import { AppButton } from "../../components/ui/AppButton";
import { Sidenav } from "../../components/ui/sidenav";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Lottie from "lottie-react";
import coinCirclingWallet from "../../assets/coin circling wallet.json";

export const AdminFunding = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const statusFilter = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("status");
  }, [location.search]);

  const filteredApplications = useMemo(() => {
    if (!fundingApplication) return [];
    if (!statusFilter) return fundingApplication;
    return (fundingApplication || []).filter((app: any) => {
      return (app.status || "").toLowerCase() === statusFilter.toLowerCase();
    });
  }, [fundingApplication, statusFilter]);

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
        <Sidenav active="application" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden z-20">
        <Sidenav active="application" />
      </div>

      {/* Main Content */}
      <main className="ml-16 transition-all duration-300 w-full">
        <div className="px-6 py-8 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-16 max-lg:mb-12 max-sm:mb-8">
              <Typography variant="h4" className="text-4xl max-lg:text-3xl max-sm:text-2xl font-bold text-gray-900 mb-6 max-lg:mb-4 max-sm:mb-3">
                Funding Applications
              </Typography>
              <Typography variant="paragraph" className="text-xl max-lg:text-base max-sm:text-sm text-gray-600 max-w-2xl">
                Manage and review all funding applications
              </Typography>
            </div>

            <ApplicationsTable
              rows={filteredApplications || []}
              keyFor={(app: any) => app.id}
              columns={[
                { id: 'id', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">Application ID</Typography>) },
                { id: 'startup', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">Startup</Typography>) },
                { id: 'investor', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider">Investor</Typography>) },
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
                  case 'investor':
                    return (<Typography variant="small" className="text-gray-900">{app.investor_name || '-'}</Typography>);
                  case 'date':
                    return (<Typography variant="small" className="text-gray-500">{app.date}</Typography>);
                  case 'status':
                    return (<StatusBadge status={app.status} />);
                  case 'actions':
                    return (
                      <AppButton variant="outline" size="sm" onClick={() => navigate(`/application/${app.id}`)}>
                        View Details
                      </AppButton>
                    );
                  default:
                    return null;
                }
              }}
              tabletColumns={[
                { id: 'details', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Application Details</Typography>) },
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
                        <Typography variant="small" className="text-gray-900 text-sm">Investor: {app.investor_name || '-'}</Typography>
                        <Typography variant="small" className="text-gray-500 text-sm">Date: {app.date}</Typography>
                      </div>
                    );
                  case 'status':
                    return (<StatusBadge status={app.status} />);
                  case 'actions':
                    return (
                      <AppButton variant="outline" size="sm" onClick={() => navigate(`/application/${app.id}`)}>
                        View Details
                      </AppButton>
                    );
                  default:
                    return null;
                }
              }}
              mobileColumns={[
                { id: 'details', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Application Details</Typography>) },
                { id: 'actions', header: (<Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Actions</Typography>), align: 'center' },
              ] as ApplicationsTableColumn[]}
              renderMobileCell={(app: any, columnId: string) => {
                switch (columnId) {
                  case 'details':
                    return (
                      <div className="space-y-2">
                        <Typography variant="small" className="font-bold text-gray-900 text-sm">#{app.id}</Typography>
                        <Typography variant="small" className="text-gray-900 text-xs">Startup: {app.startup_name}</Typography>
                        <Typography variant="small" className="text-gray-900 text-xs">Investor: {app.investor_name || '-'}</Typography>
                        <Typography variant="small" className="text-gray-500 text-xs">Date: {app.date}</Typography>
                        <div className="pt-1">
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    );
                  case 'actions':
                    return (
                      <AppButton variant="outline" size="sm" onClick={() => navigate(`/application/${app.id}`)}>
                        View Details
                      </AppButton>
                    );
                  default:
                    return null;
                }
              }}
              emptyState={(
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Typography variant="paragraph" className="text-lg text-gray-500 mb-2">No applications found</Typography>
                    <Typography variant="small" className="text-gray-400">{statusFilter ? `No applications with status "${statusFilter}"` : 'No applications available'}</Typography>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
