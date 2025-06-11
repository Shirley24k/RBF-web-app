import { IconButton, Typography } from "@material-tailwind/react";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { Sidenav } from "../../components/sidenav";

export const AdminTransactionDetails = () => {
  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>

      {/* Main Content */}
      <div className="ml-[255px] p-10 w-full overflow-auto">
        <div className="space-y-6 max-w-[1200px] ml-[20px]">
          <div className="py-8 flex items-center ">
            <IconButton
              variant="text"
              className="mr-4 flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </IconButton>
            <Typography variant="h4" color="blue-gray">
              Transaction Details
            </Typography>
          </div>

          {/* Table Headers */}
          <table className="w-[90%] table-auto text-left mx-10">
          <thead>
            <tr className="text-gray-600 border-b border-gray-300">
              <th className="px-4 py-3">Transaction Name</th>
              <th className="px-4 py-3">Datetime</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            <tr className="border-b border-gray-300">
              <td className="px-4 py-3">Repayment</td>
              <td className="px-4 py-3">2024-06-19 08:00:00</td>
              <td className="px-4 py-3">RM 150.00</td>
              <td className="px-4 py-3">Startup B</td>
              <td className="px-4 py-3">InvestCo</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-3">Fund disbursement</td>
              <td className="px-4 py-3">2024-05-18 08:00:00</td>
              <td className="px-4 py-3">RM 20,000.00</td>
              <td className="px-4 py-3">InvestCo</td>
              <td className="px-4 py-3">Startup B</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
