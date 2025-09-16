import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Alert, Typography } from "@material-tailwind/react";
import { useState } from "react";
import AppButton from "../../components/ui/AppButton";
import { Sidenav } from "../../components/ui/sidenav";

export const SuccessSubmitFunding = (): JSX.Element => {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="application" />
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="application" />
      </div>

      {/* Main Content */}
      <div className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 h-screen transition-all duration-300">
        {/* Main content area */}
        <div className="flex-1 p-8 overflow-y-auto">
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
              <div className="mb-8">
                <AppButton
                  variant="outline"
                  size="lg"
                  className="flex flex-row items-center justify-center gap-2 hover:!bg-transparent"
                  onClick={() => {
                    window.location.href = "/startup-funding";
                  }}
                >
                  <MagnifyingGlassIcon className="w-4 h-4 max-md:w-3 max-md:h-3 max-sm:w-3 max-sm:h-3" />
                  <span className="font-bold text-dark-plum text-sm max-md:text-xs tracking-[0] leading-[21px] whitespace-nowrap">
                    Track Your Application Here
                  </span>
                </AppButton>
              </div>
            </div>
          </div>

          {/* Alert at the bottom */}
          <div className="flex justify-center items-center px-4 py-4">
            <Alert
              open={open}
              variant="ghost"
              color="gray"
              onClose={() => setOpen(false)}
              className="w-fit rounded-lg border-none fixed bottom-20 mx-4 px-3 py-4 font-medium text-sm max-md:text-xs"
            >
              Your application is sent successfully! Please wait the
              investor&apos;s acceptance.
            </Alert>
          </div>
        </div>
      </div>
    
  );
};
