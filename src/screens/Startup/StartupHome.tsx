import {
  ArrowTrendingUpIcon,
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
import { StatusBadge } from "../../components/StatusBadge";

export const StartupHome = (): JSX.Element => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isStripeLinked, setIsStripeLinked] = useState(localStorage.getItem("isStripeLinked") === "true");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidenavOpen");
    return saved === null ? true : saved === "true";
  });
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    ongoingApplications: 0,
    completedApplications: 0,
    failedApplications: 0,
    totalFundingReceived: 0,
    successRate: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if(params.get('stripe_linked') === '1'){
      localStorage.setItem('isStripeLinked', 'true');
      setIsStripeLinked(true);
    }
    fetchAnalytics();
    fetchRecentApplications();
  }, []);

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
        // Map backend stats to frontend analytics format
        setAnalytics({
          totalApplications: data.stats.total || 0,
          ongoingApplications: data.stats.ongoing || 0,
          completedApplications: data.stats.completed || 0,
          failedApplications: data.stats.failed || 0,
          totalFundingReceived: data.stats.total_funding_received || 0,
          successRate: data.stats.success_rate || 0
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/startup/recent-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data.data;
      
      if (data) {
        setRecentApplications(data);
      }
    } catch (error) {
      console.error("Error fetching recent applications:", error);
    }
  };
  
  const handleStripeLinking = async() => {
    try {
      const clientId = import.meta.env.VITE_STRIPE_CLIENT_ID;
      const redirectUri = encodeURIComponent('http://localhost:8000/api/stripe/oauth/callback');
      const userInfo = {
        user_id: (user as any)?.id,
        role: (user as any)?.role,
        email: (user as any)?.email
      };
      const state = btoa(JSON.stringify(userInfo));
      const stripeUrl = `https://connect.stripe.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&scope=read_write` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}`;

      window.location.href = stripeUrl;
    } catch (error: any) {
      console.error("Stripe linking failed:", error);
    }
  } 

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
          {isStripeLinked ? (
            <div className="w-full">
              {/* Header Section */}
              <div className="mb-10 max-md:mb-8 max-sm:mb-6">
                <h1 className="font-section-title font-[600] text-black text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-[normal] [font-style:normal] mb-3 max-md:mb-2 max-sm:mb-1">
                  Welcome back, Startup!
                </h1>
                <p className="text-gray-600 text-xl max-md:text-lg max-sm:text-base">
                  Here's your funding journey overview
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-80 max-md:h-64 max-sm:h-48">
                  <Spinner className="h-16 w-16 max-md:h-12 max-md:w-12 max-sm:h-10 max-sm:w-10 text-dark-plum" />
                </div>
              ) : (
                <>
                  {/* Analytics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-md:gap-6 max-sm:gap-4 mb-10 max-md:mb-8 max-sm:mb-6">
                    <StatCard
                      title="Total Applications"
                      value={analytics.totalApplications}
                      icon={DocumentTextIcon}
                      color="border-l-blue-500"
                    />
                    <StatCard
                      title="Ongoing"
                      value={analytics.ongoingApplications}
                      icon={ClockIcon}
                      color="border-l-yellow-500"
                    />
                    <StatCard
                      title="Completed"
                      value={analytics.completedApplications}
                      icon={CheckCircleIcon}
                      color="border-l-green-500"
                    />
                    <StatCard
                      title="Failed"
                      value={analytics.failedApplications}
                      icon={XCircleIcon}
                      color="border-l-red-500"
                    />
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-md:gap-6 max-sm:gap-4 mb-10 max-md:mb-8 max-sm:mb-6">
                    <div className="bg-white rounded-xl p-8 max-md:p-6 max-sm:p-4 shadow-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-6 max-md:mb-4 max-sm:mb-3">
                        <h3 className="text-xl max-md:text-lg max-sm:text-base font-semibold text-gray-900">Funding Overview</h3>
                        <CurrencyDollarIcon className="w-8 h-8 max-md:w-6 max-md:h-6 max-sm:w-5 max-sm:h-5 text-green-500" />
                      </div>
                      <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base max-md:text-sm max-sm:text-xs text-gray-600">Total Funding Received</span>
                          <span className="font-semibold text-lg max-md:text-base max-sm:text-sm">RM {analytics.totalFundingReceived.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-base max-md:text-sm max-sm:text-xs text-gray-600">Success Rate</span>
                          <span className="font-semibold text-lg max-md:text-base max-sm:text-sm text-green-600">{analytics.successRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-8 max-md:p-6 max-sm:p-4 shadow-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-6 max-md:mb-4 max-sm:mb-3">
                        <h3 className="text-xl max-md:text-lg max-sm:text-base font-semibold text-gray-900">Processing Time</h3>
                        <ArrowTrendingUpIcon className="w-8 h-8 max-md:w-6 max-md:h-6 max-sm:w-5 max-sm:h-5 text-blue-500" />
                      </div>
                      <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base max-md:text-sm max-sm:text-xs text-gray-600">Average Days</span>
                          <span className="font-semibold text-lg max-md:text-base max-sm:text-sm">1 - 3 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-base max-md:text-sm max-sm:text-xs text-gray-600">Pending Reviews</span>
                          <span className="font-semibold text-lg max-md:text-base max-sm:text-sm text-yellow-600">{analytics.ongoingApplications}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-8 max-md:p-6 max-sm:p-4 shadow-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-6 max-md:mb-4 max-sm:mb-3">
                        <h3 className="text-xl max-md:text-lg max-sm:text-base font-semibold text-gray-900">Quick Actions</h3>
                        <ChartBarIcon className="w-8 h-8 max-md:w-6 max-md:h-6 max-sm:w-5 max-sm:h-5 text-purple-500" />
                      </div>
                      <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
                        <Button 
                          className="w-full bg-dark-plum hover:bg-light-purple text-white font-bold py-3 max-md:py-2.5 max-sm:py-2 px-6 max-md:px-4 max-sm:px-3 rounded-lg text-base max-md:text-sm max-sm:text-xs capitalize"
                          onClick={()=>{window.location.href="/submit-funding"}}
                        >
                          Submit New Application
                        </Button>
                        <Button 
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 max-md:py-2.5 max-sm:py-2 px-6 max-md:px-4 max-sm:px-3 rounded-lg text-base max-md:text-sm max-sm:text-xs capitalize"
                          onClick={()=>{window.location.href="/startup-funding"}}
                        >
                          View All Applications
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl p-8 max-md:p-6 max-sm:p-4 shadow-lg border border-gray-100">
                    <div className="flex items-center mb-6 max-md:mb-4 max-sm:mb-3">
                      <h3 className="text-xl max-md:text-lg max-sm:text-base font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
                      {recentApplications.length > 0 ? (
                        recentApplications.map((app: any) => (
                          <div 
                            key={app.id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 max-md:p-3 max-sm:p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1 mb-3 sm:mb-0">
                              <p className="font-medium text-base max-md:text-sm max-sm:text-xs">Application #{app.id}</p>
                              <p className="text-sm max-md:text-xs max-sm:text-xs text-gray-600 mt-1">
                                {app.status === 'Completed' ? 'Funding process completed' : app.status === 'In Progress' ? 'Waiting for agreement upload' : app.status === 'Pending' ? 'Pending approval from admin' : app.status === 'Active' ? 'Funding process ongoing' : app.status === 'Failed' ? 'Funding application failed' : app.status === 'Rejected' ? 'Funding application rejected' : 'Await review from investor'}
                              </p>
                              <p className="text-sm max-md:text-xs max-sm:text-xs text-gray-600 mt-1">{formatDate(app.date)}</p>
                            </div>
                            <div className="sm:ml-4 max-md:sm:ml-3 max-sm:sm:ml-2">
                              <StatusBadge status={app.status} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 max-md:py-6 max-sm:py-4">
                          <p className="text-base max-md:text-sm max-sm:text-xs text-gray-500">No recent applications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
              <div className="w-full max-w-[595px] text-center px-6 max-md:px-4 max-sm:px-3">
                <h1 className="font-section-title font-[600] text-black text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-[normal] [font-style:normal] mb-8 max-md:mb-6 max-sm:mb-4">
                  Welcome, Startup!
                </h1>

                <div className="flex flex-col items-center gap-8 max-md:gap-6 max-sm:gap-4">
                  <h2 className="font-text-3xl-font-medium font-[500] text-black text-2xl max-md:text-xl max-sm:text-lg tracking-[0px] leading-[150%] [font-style:normal]">
                    Link your Stripe account now!
                  </h2>

                  <p className="font-text-xl-font-normal font-[400] text-gray-600 text-lg max-md:text-base max-sm:text-sm tracking-[0px] leading-[150%] [font-style:normal]">
                    Connect your Stripe account before accessing our funding
                    services
                  </p>

                  <Button
                    className="mt-8 max-md:mt-6 max-sm:mt-4 bg-dark-plum hover:bg-light-purple text-white font-bold h-14 max-md:h-12 max-sm:h-10 py-4 max-md:py-3 max-sm:py-2 px-10 max-md:px-8 max-sm:px-6 rounded-lg text-base max-md:text-sm max-sm:text-xs capitalize w-full sm:w-auto"
                    onClick={handleStripeLinking}
                  >
                    Connect Stripe Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
