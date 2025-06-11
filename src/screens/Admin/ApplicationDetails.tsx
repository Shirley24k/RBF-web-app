import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import {
  Button,
  IconButton,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { useLocation } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";

export default function AdminApplicationDetails() {
  const location = useLocation();

  const { id, datetime, status } = location.state || {};

  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>

      <div className="ml-[250px] p-10 w-full overflow-auto flex flex-col items-left">
        {/* Title */}
        <div className="py-8 flex items-center mx-3">
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
            Application Details
          </Typography>
        </div>

        {/* Application Information Card */}
        <div className="max-w-[1000px] mx-16 mb-16">
          <div className="flex justify-between items-center mb-2">
            <Typography variant="h5" className="text-black">
              Application Information
            </Typography>
            {(status === "Completed" || status === "Active") && (
              <Button
                className="bg-dark-plum hover:bg-light-purple text-white font-bold text-sm py-3 px-6 rounded-lg capitalize"
                onClick={() => {
                  window.location.href = "/admin-transaction-details";
                }}
              >
                View Transaction
              </Button>
            )}
          </div>

          <hr className="border-gray-300 mb-6" />

          <div className="flex justify-between">
            <div className="flex flex-col gap-[35px] w-[262px]">
              <div className="text-black text-[20px] font-medium">
                Business Proposal
              </div>
              <div className="text-black text-[20px] font-medium">
                Application Status
              </div>
              <div className="text-black text-[20px] font-medium">
                Application Datetime
              </div>
              <div className="text-black text-[20px] font-medium">
                Funding Amount
              </div>
              <div className="text-black text-[20px] font-medium">
                Funding Purpose
              </div>
            </div>

            <div className="flex flex-col gap-[35px] w-[384px]">
              <div className="text-[20px] text-light-purple underline font-medium">
                Business proposal.pdf
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                {status}
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                {datetime}
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                RM 25000
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                Business Operation
              </div>
            </div>
          </div>
        </div>

        {/* Startup Information Card */}
        <div className="max-w-[1000px] mx-16 mb-16">
          <Typography variant="h5" className="text-black mb-2">
            Startup Information
          </Typography>
          <hr className="border-gray-300 mb-6" />

          <div className="flex justify-between">
            <div className="flex flex-col gap-[35px] w-[262px]">
              <div className="text-black text-[20px] font-medium">
                Applicant Name
              </div>
              <div className="text-black text-[20px] font-medium">
                Phone Number
              </div>
              <div className="text-black text-[20px] font-medium">
                Company Name
              </div>
              <div className="text-black text-[20px] font-medium">
                Business Email Address
              </div>
              <div className="text-black text-[20px] font-medium">
                Company Sector
              </div>
              <div className="text-black text-[20px] font-medium">
                Company Address
              </div>
            </div>

            <div className="flex flex-col gap-[35px] w-[384px]">
              <div className="text-[20px] text-light-purple font-medium">
                Tan Jenny
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                +6012-345 6789
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                Startup A
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                startupA@gmail.com
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                FinTech
              </div>
              <div className="text-[20px] text-light-purple font-medium">
                345, Jalan Startup, Bandar Startup 43000 Selangor, Malaysia.
              </div>
            </div>
          </div>
        </div>

        {/* Investor Information */}
        <div className="max-w-[1000px] mx-16 mb-16">
          <Typography variant="h5" className="text-black mb-2">
            Investor Information
          </Typography>
          <hr className="border-gray-300 mb-6" />

          <div className="flex justify-between">
            {/* Labels */}
            <div className="w-[262px] flex flex-col gap-[35px]">
              <div className="text-black text-[20px] font-medium leading-[30px]">
                Name
              </div>
              <div className="text-black text-[20px] font-medium leading-[30px]">
                Phone Number
              </div>
              <div className="text-black text-[20px] font-medium leading-[30px]">
                Email Address
              </div>
              <div className="text-black text-[20px] font-medium leading-[30px]">
                Country
              </div>
            </div>

            {/* Values */}
            <div className="flex flex-col gap-[35px] w-[384px]">
              <div className="text-light-purple text-[20px] font-medium leading-[30px]">
                John Tan
              </div>
              <div className="text-light-purple text-[20px] font-medium leading-[30px]">
                +6012-345 6789
              </div>
              <div className="text-light-purple text-[20px] font-medium leading-[30px]">
                john@gmail.com
              </div>
              <div className="text-light-purple text-[20px] font-medium leading-[30px]">
                Malaysia
              </div>
            </div>
          </div>
        </div>

        {/* Agreement review */}
        {status === "Pending" && (
          <div className="max-w-[1000px] mx-16 mb-10 p-2">
            <Typography variant="h5" className="text-black mb-4">
              Agreement Review
            </Typography>
            <Typography className="text-gray-500 mb-6 font-description">
              Approve the application if the agreements uploaded by both startup
              and investor match. If decline, please provide a remark to startup
              and investor.
            </Typography>

            <Typography
              variant="small"
              className="text-gray-500 mb-2 font-small-text"
            >
              Click to view:
            </Typography>

            <div className="flex flex-col gap-2 mb-6">
              <Typography
                as="a"
                href="#"
                className="text-deep-purple-600 font-semibold underline text-sm"
              >
                Startup agreement
              </Typography>
              <Typography
                as="a"
                href="#"
                className="text-deep-purple-600 font-semibold underline text-sm"
              >
                Investor agreement
              </Typography>
            </div>

            <Textarea
              variant="outlined"
              label="Message"
              className="mb-6 bg-white border border-gray-500 text-gray-700"
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                className="normal-case bg-dark-plum text-white hover:bg-light-purple"
                onClick={() => {
                  window.location.href = "/admin-funding";
                }}
              >
                Approve
              </Button>
              <Button
                className="normal-case text-dark-plum hover:bg-light-purple hover:text-white border-none"
                variant="outlined"
                onClick={() => {
                  window.location.href = "/admin-funding";
                }}
              >
                Decline
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
