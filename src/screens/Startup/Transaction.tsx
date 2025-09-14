import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import { StatusBadge } from "../../components/StatusBadge";
import { handleStaffPermissionError } from "../../utils/permissionHandler";

export const StartupTransaction = (): JSX.Element => {
  const [applications, setApplications] = useState<any>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  //fetch active and completed applications
  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/startup/transaction-applications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      
      setApplications(response.data.data);
      console.log('Applications', response.data.data);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      
      // Handle staff permission errors specifically
      if (handleStaffPermissionError(error, 'Insufficient permissions to view transaction applications', 'view transaction applications')) {
        return;
      }
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

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
              <Typography variant="h4" className="text-4xl max-lg:text-3xl max-sm:text-2xl font-bold text-gray-900 mb-6 max-lg:mb-4 max-sm:mb-3">
                Transaction History
              </Typography>
              <Typography variant="paragraph" className="text-xl max-lg:text-base max-sm:text-sm text-gray-600 max-w-2xl">
                Track your funding transactions and payments
              </Typography>
            </div>

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
                              Investor
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
                                {application.investor_name}
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
                                  Investor: {application.investor_name}
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
                                  Investor: {application.investor_name}
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
    </div>
  );
};
