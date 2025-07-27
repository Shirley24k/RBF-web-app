import { Button } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Sidenav } from "../../components/sidenav";

export const StartupHome = (): JSX.Element => {
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
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <div className="w-full relative flex">
        {/* Sidebar */}
        <Sidenav active="home" />

        {/* Main Content */}
        <main className="flex-1 p-6 flex flex-col items-center">
          {isStripeLinked ? (
            <div className="mt-[99px] mb-[108px] w-full max-w-[595px] text-center">
              <h1 className="font-section-title font-[600] text-black text-[length:48px] tracking-[-0.96px] leading-[normal] [font-style:normal] mb-[108px]">
                Welcome, Startup!
              </h1>

              <div className="flex flex-col items-center gap-8">
                <h2 className="font-text-3xl-font-medium font-[500] text-black text-[length:30px] tracking-[0px] leading-[150%] [font-style:normal]">
                  Get Started on your Funding Journey!
                </h2>

                <p className="font-text-xl-font-normal font-[400] text-gray-600 text-[length:20px] tracking-[0px] leading-[150%] [font-style:normal]">
                  Begin your path to business growth with flexible funding
                  options
                </p>

                <Button 
                className="mt-8 bg-dark-plum hover:bg-light-purple text-white font-bold h-12 py-[5px] px-[145px] rounded-lg text-sm capitalize"
                onClick={()=>{window.location.href="/submit-funding"}} >
                  Get Funded
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-[99px] mb-[108px] w-full max-w-[595px] text-center">
              <h1 className="font-section-title font-[600] text-black text-[length:48px] tracking-[-0.96px] leading-[normal] [font-style:normal] mb-[108px]">
                Welcome, Startup!
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
                  onClick={handleStripeLinking}
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
