import { ArrowUpTrayIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  CardBody,
  IconButton,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { useLocation } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";

export const InvestorApplicationDetails = () => {
  const location = useLocation();
  const { name, datetime, status } = location.state || {};

  return (
    <div className="bg-white min-h-screen flex">
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>

      <div className="ml-[341px] flex flex-col flex-1 ">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
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
              Application Details
            </Typography>
          </div>

          <Card className="mb-8">
            <CardBody className="flex flex-col gap-y-1">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Startup Information
              </Typography>
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col gap-y-6">
                  <Typography variant="h6" color="blue-gray">
                    Applicant Name
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Phone Number
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Company Name
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Business Email Address
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Company Sector
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    Company Address
                  </Typography>
                </div>
                <div className="flex flex-col gap-y-6">
                  <Typography color="gray" className="font-[400]">
                    Tan Jenny
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    +6012-345 6789
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    {name}
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    startup@gmail.com
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    FinTech
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    345, Jalan Startup, Bandar Startup 43000 Selangor, Malaysia.
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

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

          <div className="mb-8">
            {status === "Await Review" ? (
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Application Decision
                </Typography>
                <Typography color="gray" className="mb-4 font-[400]">
                  Dear investor, kindly indicate whether you accept or decline
                  this application. A message to the startup is required,
                  regardless of your decision. If you choose to accept, please
                  include details on how to proceed with the remaining funding
                  process. If you decide to decline, please provide a polite and
                  constructive reason for your decision.
                </Typography>
                <Textarea
                  variant="outlined"
                  label="Message"
                  className="mb-6 bg-white border border-gray-500"
                />
                <div className="flex justify-end gap-4">
                  <Button
                    className="bg-dark-plum text-white hover:bg-light-purple capitalize"
                    onClick={() => {
                      window.history.back();
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize"
                    variant="outlined"
                    onClick={() => {
                      window.history.back();
                    }}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ) : status === "In Progress" ? (
              <div className="mb-8">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Upload Agreement
                </Typography>

                <Typography className="mb-4 font-[400]" color="gray">
                  Kindly upload a copy of signed agreement between you and the
                  investor. Please convert into
                  <span className="font-bold"> .pdf </span>
                  format for submission.
                </Typography>

                <Button className="border border-solid border-[#574964c7] rounded-[5px] bg-transparent shadow-none w-full max-w-[243px]">
                  <div className="flex items-center justify-center gap-[19px]">
                    <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-text-sm-font-medium text-gray-500 text-sm capitalize">
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
