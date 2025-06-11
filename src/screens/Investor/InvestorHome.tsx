import { useState } from "react";
import { Button } from "@material-tailwind/react";
import { Sidenav } from "../../components/sidenav";

export const InvestorHome = (): JSX.Element => {
  //set state for stripe linking status
  const [isStripeLinked, setIsStripeLinked] = useState(false);

  return (
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <div className="w-full relative flex">
        {/* Sidebar */}
        <Sidenav active="home" />

        {/* Main Content */}
        <main className="flex-1 p-6 flex flex-col items-center">
          {isStripeLinked ? (
            <div className="mt-[99px] mb-[108px] w-full max-w-[595px] text-center">
              <h1 className="font-section-title font-[600] text-black text-[length:48px] tracking-[-0.96px] leading-[normal] [font-style:normal] mb-[108px]">
                Welcome, Investor!
              </h1>

              <div className="flex flex-col items-center gap-8">
                <h2 className="font-text-3xl-font-medium font-[500] text-black text-[length:30px] tracking-[0px] leading-[150%] [font-style:normal]">
                  Get Started on your Funding Journey!
                </h2>

                <p className="font-text-xl-font-normal font-[400] text-gray-600 text-[length:20px] tracking-[0px] leading-[150%] [font-style:normal]">
                  Begin your path to help business growth with flexible funding
                  options
                </p>

                <Button className="mt-8 bg-dark-plum hover:bg-light-purple text-white font-bold h-12 py-[5px] px-[145px] rounded-lg text-sm capitalize">
                  <a href="/investor-funding">View Application</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-[99px] mb-[108px] w-full max-w-[595px] text-center">
              <h1 className="font-section-title font-[600] text-black text-[length:48px] tracking-[-0.96px] leading-[normal] [font-style:normal] mb-[108px]">
                Welcome, Investor!
              </h1>

              <div className="flex flex-col items-center gap-8">
                <h2 className="font-text-3xl-font-medium font-[500] text-black text-[length:30px] tracking-[0px] leading-[150%] [font-style:normal]">
                  Link your Stripe account now!
                </h2>

                <p className="font-text-xl-font-normal font-[400] text-gray-600 text-[length:20px] tracking-[0px] leading-[150%] [font-style:normal]">
                  Connect your Stripe account before accessing our funding
                  services
                </p>

                <Button
                  className="mt-8 bg-dark-plum hover:bg-light-purple text-white font-bold h-12 py-[5px] px-[145px] rounded-lg text-sm capitalize"
                  onClick={() => setIsStripeLinked(true)}
                >
                  Connect Stripe Account
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
