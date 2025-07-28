import { FunnelIcon } from "@heroicons/react/24/solid";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import { StatusBadge } from "../../components/StatusBadge";

export const StartupTransaction = (): JSX.Element => {
  const [applications, setApplications] = useState<any>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  //fetch active and completed applications
  const fetchApplications = async () => {
    await axios.get(`${API_BASE_URL}/startup/transaction-applications`, {
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

  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="transactions" />
      </div>

      {/* Main Content */}
      <div className="ml-[255px] p-10 w-full overflow-auto">
        <div className="space-y-6 max-w-[1200px] ml-[20px]">
          {/* Title */}
          <div className="px-4 py-8 mx-10">
            <Typography variant="h4" color="blue-gray">
              Transaction History
            </Typography>
          </div>

          {/* Table */}
          <table className="w-[90%] table-auto text-left mx-10">
            <thead>
              <tr className="text-gray-600 border-b border-gray-300">
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Investor</th>
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
                  <td className="px-4 py-3">{application.investor_name}</td>
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
        </div>
      </div>
    </div>
  );
};
