import { Button } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Sidenav } from "../../components/sidenav";

export const InvestorHome = (): JSX.Element => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isStripeLinked, setIsStripeLinked] = useState(localStorage.getItem("isStripeLinked") === "true");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if(params.get('stripe_linked') === '1'){
      localStorage.setItem('isStripeLinked', 'true');
      setIsStripeLinked(true);
    }
  }, []);
  
  const handleStripeLinking = async() => {
    try {
      const clientId = import.meta.env.VITE_STRIPE_CLIENT_ID; // Replace with your real client ID
      const redirectUri = encodeURIComponent('http://localhost:8000/api/stripe/oauth/callback');
      const userInfo = {
        user_id: (user as any)?.id,
        role: (user as any)?.role,
        email: (user as any)?.email
      };
      const state = btoa(JSON.stringify(userInfo)); // Base64 encode
      const stripeUrl = `https://connect.stripe.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&scope=read_write` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}`;

      window.location.href = stripeUrl;
    } catch (error: any) {
      console.error("Stripe linking failed:", error);
    }
  }
  
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="home" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="home" />
      </div>

      {/* Main Content */}
      <main className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1">
        <div className="flex-1 p-6 max-md:p-4 max-sm:p-3 flex flex-col items-center justify-center min-h-screen">
          {isStripeLinked ? (
            <div className="w-full max-w-[595px] text-center px-4 max-md:px-2">
              <h1 className="font-section-title font-[600] text-black text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-[normal] [font-style:normal] mb-8 max-md:mb-6 max-sm:mb-4">
                Welcome, Investor!
              </h1>

              <div className="flex flex-col items-center gap-6 max-md:gap-4 max-sm:gap-3">
                <h2 className="font-text-3xl-font-medium font-[500] text-black text-2xl max-md:text-xl max-sm:text-lg tracking-[0px] leading-[150%] [font-style:normal]">
                  Get Started on your Funding Journey!
                </h2>

                <p className="font-text-xl-font-normal font-[400] text-gray-600 text-lg max-md:text-base max-sm:text-sm tracking-[0px] leading-[150%] [font-style:normal]">
                  Begin your path to help business growth with flexible funding
                  options
                </p>

                <Button className="mt-6 max-md:mt-4 max-sm:mt-3 bg-dark-plum hover:bg-light-purple text-white font-bold h-12 max-md:h-10 max-sm:h-8 py-3 max-md:py-2.5 max-sm:py-2 px-8 max-md:px-6 max-sm:px-4 rounded-lg text-sm max-md:text-xs capitalize w-full sm:w-auto">
                  <a href="/investor-funding">View Application</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[595px] text-center px-4 max-md:px-2">
              <h1 className="font-section-title font-[600] text-black text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-[normal] [font-style:normal] mb-8 max-md:mb-6 max-sm:mb-4">
                Welcome, Investor!
              </h1>

              <div className="flex flex-col items-center gap-6 max-md:gap-4 max-sm:gap-3">
                <h2 className="font-text-3xl-font-medium font-[500] text-black text-2xl max-md:text-xl max-sm:text-lg tracking-[0px] leading-[150%] [font-style:normal]">
                  Link your Stripe account now!
                </h2>

                <p className="font-text-xl-font-normal font-[400] text-gray-600 text-lg max-md:text-base max-sm:text-sm tracking-[0px] leading-[150%] [font-style:normal]">
                  Connect your Stripe account before accessing our funding
                  services
                </p>

                <Button
                  className="mt-6 max-md:mt-4 max-sm:mt-3 bg-dark-plum hover:bg-light-purple text-white font-bold h-12 max-md:h-10 max-sm:h-8 py-3 max-md:py-2.5 max-sm:py-2 px-8 max-md:px-6 max-sm:px-4 rounded-lg text-sm max-md:text-xs capitalize w-full sm:w-auto"
                  onClick={handleStripeLinking}
                >
                  Connect Stripe Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
