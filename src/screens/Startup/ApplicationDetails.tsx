import { ArrowUpTrayIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  CardBody,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useLocation } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";

export const StartupApplicationDetails = (): JSX.Element => {
  const location = useLocation();
  const { investor, datetime, status } = location.state || {};

  return (
    <div className="bg-white min-h-screen flex">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>

      {/* Content */}
      <div className="ml-[341px] flex flex-col flex-1">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
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
              Application Details
            </Typography>
          </div>

          {/* Investor Info */}
          <Card className="mb-8">
            <CardBody className="flex flex-col gap-y-1">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Investor Information
              </Typography>
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col gap-y-6">
                  <Typography variant="h6" color="blue-gray">
                    Name
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Phone Number
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Email Address
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Country
                  </Typography>
                </div>
                <div className="flex flex-col gap-y-6">
                  <Typography color="gray" className="font-[400]">
                    {investor}
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    +6012-345 6789
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    john@gmail.com
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    Malaysia
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Application Info */}
          <Card className="mb-8">
            <CardBody className="flex flex-col gap-y-1">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Application Information
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-6">
                  <Typography variant="h6" color="blue-gray">
                    Business Proposal
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Application Status
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Application Datetime
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Funding Amount
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Funding Purpose
                  </Typography>
                </div>
                <div className="flex flex-col gap-y-6">
                  <Typography color="gray" className="underline font-[400]">
                    Business proposal.pdf
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    {status}
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    {datetime}
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    RM 25000
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    Business Operation
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Upload Section */}

          <div className="mb-8">
            {status === "In Progress" && (
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Upload Agreement
                </Typography>
                <Typography color="gray" className="mb-4 font-[400]">
                  Kindly upload a copy of signed agreement between you and the
                  investor. Please convert into <strong> .pdf</strong> format for
                  submission.
                </Typography>

                <Button className="border border-solid border-[#574964c7] rounded-[5px] bg-transparent shadow-none w-full max-w-[243px] mb-2">
                  <div className="flex items-center justify-center gap-[19px]">
                    <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-500 font-medium capitalize">
                      Upload agreement
                    </span>
                  </div>
                </Button>

                <Typography
                  variant="small"
                  className="text-gray-500 font-[380] mt-2 mb-8"
                >
                  Accepted file type: PDF
                </Typography>

                <div className="flex gap-4">
                  <Button
                    className="bg-dark-plum text-white hover:bg-light-purple capitalize"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.back();
                    }}
                  >
                    Submit
                  </Button>
                  <Button
                    className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize"
                    variant="outlined"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.back();
                    }}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
