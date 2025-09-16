import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { MonthlyChart } from "../../components/MonthlyChart";
import { AppButton } from "../../components/ui/AppButton";
import { Sidenav } from "../../components/ui/sidenav";
import { StatCard } from "../../components/ui/StatCard";
import Lottie from "lottie-react";
import coinCirclingWallet from "../../assets/coin circling wallet.json";

export const AdminHome = (): JSX.Element => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [applications, setApplications] = useState<any>([]);

  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    awaitReviewApplications: 0,
    pendingApplications: 0,
    inProgressApplications: 0,
    activeApplications: 0,
    completedApplications: 0,
    rejectedApplications: 0,
    failedApplications: 0,
    totalStartups: 0,
    totalInvestors: 0,
    totalFundingAmount: 0,
    // Monthly analytics - new registrations
    newApplicationsThisMonth: 0,
    newStartupsThisMonth: 0,
    newInvestorsThisMonth: 0,
    month: ''
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Convert status distribution to MonthlyChart format
  const createStatusChartData = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    return [{
      month: currentMonth,
      month_name: currentMonthName,
      await_review: analytics.awaitReviewApplications,
      pending: analytics.pendingApplications,
      in_progress: analytics.inProgressApplications,
      active: analytics.activeApplications,
      completed: analytics.completedApplications,
      failed: analytics.failedApplications,
      rejected: analytics.rejectedApplications || 0
    }];
  };

  // Update chart data when analytics change
  useEffect(() => {
    if (analytics.awaitReviewApplications > 0 || analytics.pendingApplications > 0 || analytics.inProgressApplications > 0 || 
        analytics.activeApplications > 0 || analytics.completedApplications > 0 || analytics.failedApplications > 0) {
      setChartData(createStatusChartData());
    }
  }, [analytics]);
  
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
          rejectedApplications: data.stats.rejected || 0,
          totalStartups: data.stats.total_startups || 0,
          totalInvestors: data.stats.total_investors || 0,
          totalFundingAmount: data.stats.total_funding_amount || 0,
          // Monthly analytics - new registrations
          newApplicationsThisMonth: data.stats.new_applications_this_month || 0,
          newStartupsThisMonth: data.stats.new_startups_this_month || 0,
          newInvestorsThisMonth: data.stats.new_investors_this_month || 0,
          month: data.stats.month || '',
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
        <Sidenav active="home" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden z-20">
        <Sidenav active="home" />
      </div>

      {/* Main Content */}
      <main className="ml-32 transition-all duration-300 w-full">
        <div className="px-6 py-8 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="w-full">
              <div className="mb-16 max-lg:mb-12 max-sm:mb-8">
                <Typography variant="h4" className="text-4xl max-lg:text-3xl max-sm:text-2xl font-bold text-gray-900 mb-6 max-lg:mb-4 max-sm:mb-3">
                  Welcome, Admin!
                </Typography>
                <Typography variant="paragraph" className="text-xl max-lg:text-base max-sm:text-sm text-gray-600 max-w-2xl">
                  Platform overview and management dashboard
                </Typography>
              </div>

              <div className="space-y-12 max-lg:space-y-8">
                  {/* Application Status Distribution Chart */}
                  <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                    <div className="flex flex-row items-center justify-between mb-8 max-lg:mb-6 max-sm:mb-4">
                      <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">
                        Current Application Status Distribution
                      </Typography>
                    </div>
                    {chartData.length > 0 ? (
                      <MonthlyChart
                        data={chartData}
                        currentMonthIndex={currentMonthIndex}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <Typography variant="paragraph" className="text-gray-500">No data available</Typography>
                      </div>
                    )}
                  </div>

                  {/* Monthly Analytics */}
                  <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-8 max-lg:mb-6 max-sm:mb-4">
                      <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">
                        This Month's Activity ({analytics.month})
                      </Typography>
                    </div>
                    <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6 max-lg:gap-4">
                      <StatCard
                          title="New Applications"
                          value={analytics.newApplicationsThisMonth}
                        icon={DocumentTextIcon}
                        color="border-l-blue-500"
                      />
                      <StatCard
                          title="New Startups"
                          value={analytics.newStartupsThisMonth}
                          icon={UserGroupIcon}
                        color="border-l-green-500"
                      />
                      <StatCard
                          title="New Investors"
                          value={analytics.newInvestorsThisMonth}
                          icon={UserGroupIcon}
                        color="border-l-purple-500"
                      />
                    </div>
                  </div>


                  {/* Platform Overview */}
                  <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-8 max-lg:gap-6">
                    {/* Platform Statistics */}
                    <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-8 max-lg:mb-6 max-sm:mb-4">
                        <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">Platform Stats</Typography>
                        <ChartBarIcon className="w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-5 max-sm:h-5 text-blue-500" />
                      </div>
                      <div className="space-y-6 max-lg:space-y-4 max-sm:space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Total Applications</span>
                          <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">{analytics.totalApplications}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Total Startups</span>
                          <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">{analytics.totalStartups}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Total Investors</span>
                          <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">{analytics.totalInvestors}</span>
                        </div>
                      </div>
                    </div>

                    {/* Funding Insights */}
                    <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-8 max-lg:mb-6 max-sm:mb-4">
                        <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">Funding Insights</Typography>
                        <CurrencyDollarIcon className="w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-5 max-sm:h-5 text-green-500" />
                      </div>
                      <div className="space-y-6 max-lg:space-y-4 max-sm:space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Total Funding</span>
                          <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900 whitespace-nowrap">RM {analytics.totalFundingAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Success Rate</span>
                          <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900 whitespace-nowrap">{analytics.totalApplications > 0 ? Math.round(((analytics.completedApplications + analytics.activeApplications) / analytics.totalApplications) * 100) : 0}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-lg max-lg:text-base max-sm:text-sm text-gray-600">Completion Rate</span>
                          <span className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-green-600">
                            {analytics.totalApplications > 0 ? Math.round((analytics.completedApplications / analytics.totalApplications) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Row */}
                  <div className="bg-white rounded-2xl p-8 max-lg:p-6 shadow-sm border border-gray-200">
                    <div className="flex flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 max-lg:gap-3 max-sm:gap-2">
                        <UserGroupIcon className="w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-5 max-sm:h-5 text-orange-500" />
                        <Typography variant="h4" className="text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">Quick Actions</Typography>
                      </div>
                      <AppButton 
                        variant={applications && applications.length > 0 ? 'danger' : 'primary'}
                        size="lg"
                        className="max-sm:text-xs max-sm:py-1.5 max-sm:px-3"
                        onClick={()=>{
                          window.location.href = `${applications && applications.length > 0 ? '/admin-funding?status=Pending' : '/admin-funding'}`;
                        }}
                      >
                        {applications && applications.length > 0 ? `Review Applications (${applications.length})` : 'View Applications'}
                      </AppButton>
                    </div>
                  </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};
