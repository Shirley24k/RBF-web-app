import { FunnelIcon } from "@heroicons/react/24/solid";
import { Button, Typography } from "@material-tailwind/react";
import { Sidenav } from "../../components/sidenav";
import { StatusBadge } from "../../components/StatusBadge";

// Transaction data for mapping
const transactions = [
  {
    id: 1,
    investor: "InvestCo",
    datetime: "2024-06-19 08:00:00",
    status: "Active",
  },
  {
    id: 2,
    investor: "InvestCo",
    datetime: "2023-02-23 08:00:00",
    status: "Completed",
  },
];

export const StartupTransaction = (): JSX.Element => {
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
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-300">
                  <td className="px-4 py-3">{transaction.id}</td>
                  <td className="px-4 py-3">{transaction.investor}</td>
                  <td className="px-4 py-3">{transaction.datetime}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={transaction.status}></StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <a href="/transaction-details">
                      <Button
                        variant="outlined"
                        className="border-dark-plum border-2 capitalize text-sm font-bold text-dark-plum"
                      >
                        View Transaction
                      </Button>
                    </a>
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
