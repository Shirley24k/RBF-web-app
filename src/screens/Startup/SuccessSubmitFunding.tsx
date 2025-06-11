import { Alert, Button, Typography } from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Sidenav } from "../../components/sidenav";

export const SuccessSubmitFunding = (): JSX.Element => {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white min-h-screen flex">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>

      {/* Main Content */}
      <div className="ml-[200px] flex flex-col flex-1 ">
        <div className="flex-1 p-8 overflow-y-auto space-y-[400px]">
          <div className="max-w-[1014px] mx-auto mt-8">
            <Typography variant="h4" className="font-medium text-black mb-4">
              Waiting for approval
            </Typography>
            <Typography
              variant="h6"
              className="text-gray-600 font-normal mb-12"
            >
              Great! Your application has been sent to the investor. Now just
              relax — the investor is reviewing your application. You may track
              your application anytime right here on our platform.
            </Typography>

            {/* Track Application Button */}
            <div>
              <Button
                variant="outlined"
                className="flex flex-row h-12 items-center justify-center gap-2 px-[25px] py-[5px] rounded-lg border-2 border-solid border-dark-plum capitalize"
                onClick={() => {
                  window.location.href = "/startup-funding";
                }}
              >
                <MagnifyingGlassIcon className=" w-4 h-4" />
                <span className=" w-fit font-bold text-dark-plum text-sm tracking-[0] leading-[21px] whitespace-nowrap">
                  Track Your Application Here
                </span>
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-8 flex items-center justify-center">
            {/* Alert at the bottom */}
            <Alert
              open={open}
              variant="ghost"
              color="gray"
              onClose={() => setOpen(false)}
              className="w-fit rounded-lg border-none flex items-center justify-between px-3 py-4 font-medium"
            >
              Your application is sent successfully! Please wait the
              investor&apos;s acceptance.
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};
