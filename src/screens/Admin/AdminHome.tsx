import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { Button, Spinner } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Sidenav } from "../../components/sidenav";
import { StatCard } from "../../components/StatCard";

export const AdminHome = (): JSX.Element => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [applications, setApplications] = useState<any>([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidenavOpen");
    return saved === null ? true : saved === "true";
  });
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    awaitReviewApplications: 0,
    pendingApplications: 0,
    inProgressApplications: 0,
    activeApplications: 0,
    completedApplications: 0,
    failedApplications: 0,
    totalStartups: 0,
    totalInvestors: 0,
    totalFundingAmount: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  
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
  
  const fetchApplications = async () => {
    await axios.get(`${API_BASE_URL}/pending-applications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response) => {
      setApplications(response.data.data);
    })
  }

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/application-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      if (data.stats) {
        setAnalytics({
          totalApplications: data.stats.total || 0,
          awaitReviewApplications: data.stats.await_review || 0,
          pendingApplications: data.stats.pending || 0,
          inProgressApplications: data.stats.in_progress || 0,
          activeApplications: data.stats.active || 0,
          completedApplications: data.stats.completed || 0,
          failedApplications: data.stats.failed || 0,
          totalStartups: data.stats.total_startups || 0,
          totalInvestors: data.stats.total_investors || 0,
          totalFundingAmount: data.stats.total_funding_amount || 0,
          successRate: data.stats.success_rate || 0
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAnalytics();
  }, []);
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
      <Sidenav active="home" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="home" />
      </div>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : 'ml-40'} max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 transition-all duration-300`}>
        <div className="flex-1 p-8 max-md:p-6 max-sm:p-4">
          <div className="w-full">
            {/* Header Section */}
            <div className="mb-10 max-md:mb-8 max-sm:mb-6">
              <h1 className="font-section-title font-semibold text-black text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-normal mb-3 max-md:mb-2 max-sm:mb-1">
          Welcome, Admin!
        </h1>
              <p className="text-gray-600 text-xl max-md:text-lg max-sm:text-base">
                Platform overview and management dashboard
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-80 max-md:h-64 max-sm:h-48">
                <Spinner className="h-16 w-16 max-md:h-12 max-md:w-12 max-sm:h-10 max-sm:w-10 text-dark-plum" />
              </div>
            ) : (
              <>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-md:gap-4 max-sm:gap-3 mb-10 max-md:mb-8 max-sm:mb-6">
                  <StatCard
                    title="Total Applications"
                    value={analytics.totalApplications}
                    icon={DocumentTextIcon}
                    color="border-l-blue-500"
                  />
                  <StatCard
                    title="Await Review"
                    value={analytics.awaitReviewApplications}
                    icon={ClockIcon}
                    color="border-l-yellow-500"
                  />
                  <StatCard
                    title="Pending"
                    value={analytics.pendingApplications}
                    icon={ClockIcon}
                    color="border-l-orange-500"
                  />
                  <StatCard
                    title="In Progress"
                    value={analytics.inProgressApplications}
                    icon={ClockIcon}
                    color="border-l-indigo-500"
                  />
                  <StatCard
                    title="Active"
                    value={analytics.activeApplications}
                    icon={CheckCircleIcon}
                    color="border-l-green-500"
                  />
                  <StatCard
                    title="Completed"
                    value={analytics.completedApplications}
                    icon={CheckCircleIcon}
                    color="border-l-purple-500"
                  />
                  <StatCard
                    title="Failed/Rejected"
                    value={analytics.failedApplications}
                    icon={XCircleIcon}
                    color="border-l-red-500"
                  />
                </div>

                {/* Platform Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-md:gap-4 max-sm:gap-3 mb-8 max-md:mb-6 max-sm:mb-4">
                  {/* Platform Statistics */}
                  <div className="bg-white rounded-xl p-6 max-md:p-4 max-sm:p-3 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4 max-md:mb-3 max-sm:mb-2">
                      <h3 className="text-lg max-md:text-base max-sm:text-sm font-semibold text-gray-900">Platform Stats</h3>
                      <ChartBarIcon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 text-blue-500" />
                    </div>
                    <div className="space-y-3 max-md:space-y-2 max-sm:space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm max-md:text-xs text-gray-600">Total Startups</span>
                        <span className="font-semibold text-base max-md:text-sm max-sm:text-xs">{analytics.totalStartups}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm max-md:text-xs text-gray-600">Total Investors</span>
                        <span className="font-semibold text-base max-md:text-sm max-sm:text-xs">{analytics.totalInvestors}</span>
                      </div>
                    </div>
                  </div>

                  {/* Funding Insights */}
                  <div className="bg-white rounded-xl p-6 max-md:p-4 max-sm:p-3 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4 max-md:mb-3 max-sm:mb-2">
                      <h3 className="text-lg max-md:text-base max-sm:text-sm font-semibold text-gray-900">Funding Insights</h3>
                      <CurrencyDollarIcon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 text-green-500" />
                    </div>
                    <div className="space-y-3 max-md:space-y-2 max-sm:space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm max-md:text-xs text-gray-600">Total Funding</span>
                        <span className="font-semibold text-base max-md:text-sm max-sm:text-xs">RM {analytics.totalFundingAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm max-md:text-xs text-gray-600">Avg Funding</span>
                        <span className="font-semibold text-base max-md:text-sm max-sm:text-xs">RM {(analytics.totalFundingAmount / analytics.totalApplications).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm max-md:text-xs text-gray-600">Success Rate</span>
                        <span className="font-semibold text-base max-md:text-sm max-sm:text-xs text-green-600">
                          {analytics.successRate > 0 ? analytics.successRate : (analytics.totalApplications > 0 ? Math.round((analytics.completedApplications / analytics.totalApplications) * 100) : 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics - removed unsupported/duplicate metrics */}
                </div>

                {/* Quick Actions Row */}
                <div className="mb-10 max-md:mb-8 max-sm:mb-6">
                  <div className="bg-white rounded-xl p-6 max-md:p-4 max-sm:p-3 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 max-md:gap-2 max-sm:gap-1">
                        <UserGroupIcon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 text-orange-500" />
                        <h3 className="text-lg max-md:text-base max-sm:text-sm font-semibold text-gray-900">Quick Actions</h3>
                      </div>
                      <Button 
                        className={`font-bold py-2.5 max-md:py-2 max-sm:py-1.5 px-6 max-md:px-4 max-sm:px-3 rounded-lg text-sm max-md:text-xs capitalize ${
                          applications && applications.length > 0 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-dark-plum hover:bg-light-purple text-white'
                        }`}
                        onClick={()=>{
                          if (applications && applications.length > 0) {
                            window.location.href = "/admin-funding?status=Pending";
                          } else {
                            window.location.href = "/admin-funding";
                          }
                        }}
                      >
                        {applications && applications.length > 0 ? `Review Applications (${applications.length})` : 'View Applications'}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
