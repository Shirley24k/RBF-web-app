import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { IconButton, Typography } from "@material-tailwind/react";
import { Sidenav } from "../../components/sidenav";

// Transaction data
const transactions = [
  { name: "Repayment", datetime: "2024-06-19 08:00:00", value: "RM 150.00" },
  {
    name: "Fund disbursement",
    datetime: "2024-05-18 08:00:00",
    value: "RM 20000.00",
  },
];

export const TransactionDetails = (): JSX.Element => {
  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="transactions" />
      </div>

      {/* Main Content */}
      <div className="ml-[255px] p-10 w-full overflow-auto">
        <div className="space-y-6 max-w-[1200px] ml-[20px]">
          {/* Header */}
          <div className="py-8 flex items-center">
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

          {/* Transaction Table */}
          <div className="w-[90%] mx-10">
            <div className="p-4">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr className="text-gray-600 border-b border-gray-300">
                    <th className="pr-44 py-3 font-bold text-light-purple text-base">
                      Transaction Name
                    </th>
                    <th className="px-4 py-3 font-bold text-light-purple text-base">
                      Datetime
                    </th>
                    <th className="px-4 py-3 font-bold text-light-purple text-base">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="pr-44 py-3 font-semibold">
                        {transaction.name}
                      </td>
                      <td className="px-4 py-3">{transaction.datetime}</td>
                      <td className="px-4 py-3">{transaction.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
