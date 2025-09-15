import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { Button, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Sidenav } from "../../components/sidenav";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";

export const InvestorHome = (): JSX.Element => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isStripeLinked, setIsStripeLinked] = useState(localStorage.getItem("isStripeLinked") === "true");

  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    awaitReviewApplications: 0,
    pendingApplications: 0,
    ongoingApplications: 0,
    failedApplications: 0,
    completedApplications: 0,
    investorBalance: 0,
    totalInvested: 0,
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
          awaitReviewApplications: data.stats.await_review || 0,
          pendingApplications: data.stats.pending || 0,
          ongoingApplications: data.stats.ongoing || 0,
          completedApplications: data.stats.completed || 0,
          failedApplications: data.stats.failed || 0,
          investorBalance: data.stats.investor_balance || 0,
          totalInvested: data.stats.total_invested || 0,
        });
        console.log(data.stats);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);  
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/investor/recent-applications`, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0 z-20">
        <Sidenav active="home" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden z-20">
        <Sidenav active="home" />
      </div>

      {/* Main Content */}
      <main className="ml-16 transition-all duration-300 w-full">
        <div className="px-6 py-8 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
          {isStripeLinked ? (
            <div className="w-full">
              {/* Header Section */}
              <div className="mb-16 max-lg:mb-12 max-sm:mb-8">
                <Typography variant="h4" className="text-4xl max-lg:text-3xl max-sm:text-2xl font-bold text-gray-900 mb-6 max-lg:mb-4 max-sm:mb-3">
                  Welcome back, Investor!
                </Typography>
                <Typography variant="paragraph" className="text-xl max-lg:text-base max-sm:text-sm text-gray-600 max-w-2xl">
                  Here's your investment portfolio overview
                </Typography>
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6 max-lg:gap-4 mb-12 max-lg:mb-8 max-sm:mb-6">
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
              <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-8 max-lg:gap-6 mb-12 max-lg:mb-8 max-sm:mb-6">
                <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-8 max-lg:mb-6 max-sm:mb-4">
                    <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">Investment Overview</Typography>
                    <CurrencyDollarIcon className="w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-5 max-sm:h-5 text-green-500" />
                  </div>
                  <div className="space-y-6 max-lg:space-y-4 max-sm:space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Completion Rate</span>
                      <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-green-600">
                        {analytics.totalApplications > 0 ? Math.round((analytics.completedApplications / analytics.totalApplications) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Pending Admin Review</span>
                      <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">{analytics.pendingApplications}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Await Review</span>
                      <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-yellow-600">{analytics.awaitReviewApplications}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-8 max-lg:mb-6 max-sm:mb-4">
                    <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">Investor Balance</Typography>
                    <CurrencyDollarIcon className="w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-5 max-sm:h-5 text-blue-500" />
                  </div>
                  <div className="space-y-6 max-lg:space-y-4 max-sm:space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Available Balance</span>
                      <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900 whitespace-nowrap">RM {analytics.investorBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Total Invested</span>
                      <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900 whitespace-nowrap">RM {analytics.totalInvested.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-8 max-lg:mb-6 max-sm:mb-4">
                    <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">Quick Actions</Typography>
                    <ChartBarIcon className="w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-5 max-sm:h-5 text-purple-500" />
                  </div>
                  <div className="space-y-6 max-lg:space-y-4 max-sm:space-y-3">
                    <Button 
                      className="w-full bg-dark-plum hover:bg-light-purple text-white font-bold py-4 max-lg:py-3 max-sm:py-2.5 px-8 max-lg:px-6 max-sm:px-4 rounded-xl text-lg max-lg:text-base max-sm:text-sm capitalize"
                      onClick={()=>{window.location.href="/investor-funding"}}
                    >
                      View Applications
                    </Button>
                    <Button 
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 max-lg:py-3 max-sm:py-2.5 px-8 max-lg:px-6 max-sm:px-4 rounded-xl text-lg max-lg:text-base max-sm:text-sm capitalize"
                      onClick={()=>{window.location.href="/investor-profile"}}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-8 max-lg:mb-6 max-sm:mb-4">
                  <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">Recent Activity</Typography>
                </div>
                <div className="space-y-6 max-lg:space-y-4 max-sm:space-y-3">
                  {recentApplications.length > 0 ? (
                    recentApplications.map((app: any) => (
                      <div 
                        key={app.id} 
                        className="flex flex-row items-center justify-between p-6 max-lg:p-4 max-sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <Typography variant="small" className="font-bold text-lg max-lg:text-base max-sm:text-sm text-gray-900">Application #{app.id}</Typography>
                          <Typography variant="small" className="text-base max-lg:text-sm max-sm:text-xs text-gray-600 mt-1">
                            {app.status === 'Completed' ? 'Funding process completed' : app.status === 'In Progress' ? 'Waiting for agreement upload' : app.status === 'Pending' ? 'Pending approval from admin' : app.status === 'Active' ? 'Funding process ongoing' : app.status === 'Failed' ? 'Funding application failed' : app.status === 'Rejected' ? 'Funding application rejected' : 'Await review from investor'}
                          </Typography>
                          <Typography variant="small" className="text-base max-lg:text-sm max-sm:text-xs text-gray-600 mt-1">{formatDate(app.date)}</Typography>
                        </div>
                        <div className="ml-4 max-lg:ml-3 max-sm:ml-2">
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 max-lg:py-6 max-sm:py-4">
                      <Typography variant="small" className="text-lg max-lg:text-base max-sm:text-sm text-gray-500">No recent applications</Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <div className="w-full max-w-2xl text-center px-6 max-lg:px-4 max-sm:px-3">
                <Typography variant="h4" className="text-6xl max-xl:text-5xl max-lg:text-3xl max-sm:text-2xl font-bold text-gray-900 mb-8 max-lg:mb-6 max-sm:mb-4">
                  Welcome, Investor!
                </Typography>

                <div className="flex flex-col items-center gap-8 max-lg:gap-6 max-sm:gap-4">
                  <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-semibold text-gray-900">
                    Link your Stripe account now!
                  </Typography>

                  <Typography variant="paragraph" className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">
                    Connect your Stripe account before accessing our funding
                    services
                  </Typography>

                  <Button
                    className="mt-8 max-lg:mt-6 max-sm:mt-4 bg-dark-plum hover:bg-light-purple text-white font-bold py-4 max-lg:py-3 max-sm:py-2.5 px-10 max-lg:px-8 max-sm:px-6 rounded-xl text-lg max-lg:text-base max-sm:text-sm capitalize w-full sm:w-auto"
                    onClick={handleStripeLinking}
                  >
                    Connect Stripe Account
                  </Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
};
