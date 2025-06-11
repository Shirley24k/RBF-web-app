import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { Button, Typography } from "@material-tailwind/react";
import { Sidenav } from "../../components/sidenav";

export const StartupSubmitFunding = (): JSX.Element => {
  return (
    <div className="bg-[#ffffff] flex flex-row justify-center w-full">
      <div className="bg-white w-full h-[982px] relative">
        {/* Sidebar */}
        <div className="fixed w-[311px] h-full left-0 top-0">
          <Sidenav active="application" />
        </div>

        {/* Main Content */}
        <div className="ml-[311px] p-12 flex flex-col items-start">
          {/* Heading */}
          <Typography variant="h4" color="blue-gray">
            Submit Funding Application
          </Typography>

          {/* Instructions */}
          <Typography variant="h6" className="my-4 font-normal">
            <span className="leading-[30px]">
              Kindly upload your business proposal for application. Please
              convert into
            </span>
            <span className="font-bold leading-[30px]"> .pdf </span>
            <span className="leading-[30px]">format for submission. </span>
          </Typography>

          {/* Upload Button */}
          <Button className="border border-solid border-[#574964c7] rounded-[5px] bg-transparent shadow-none w-full max-w-[243px]">
            <div className="flex items-center justify-center gap-[19px]">
              <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
              <span className="font-text-sm-font-medium text-gray-500 text-sm capitalize">
                Upload document
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
              onClick={() => {
                window.location.href = "/select-investor";
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
      </div>
    </div>
  );
};
