import { Button } from "@material-tailwind/react";

export const Register = (): JSX.Element => {
  return (
    <div className="bg-beige flex flex-row justify-center w-full min-h-screen">
      <div className="w-full max-w-[1512px] relative">
        {/* Header */}
        <header className="w-full flex items-center justify-between px-4 sm:px-8 md:px-20 h-20 sm:h-[120px] md:h-[164px]">
          <div className="font-['Irish_Grover'] font-normal text-2xl sm:text-4xl md:text-5xl leading-[48px] sm:leading-[64px] md:leading-[72px]">
            <span className="text-[#073b1d]">R</span>
            <span className="text-[#574964c7]">B</span>
            <span className="text-[#073b1d]">F</span>
          </div>

          <Button
            variant="outlined"
            className="h-10 sm:h-12 px-4 sm:px-6 py-[5px] rounded-lg border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-xs sm:text-sm hover:bg-light-purple hover:text-white capitalize"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Home
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center mt-8 sm:mt-10 px-4 sm:px-0">
          <h1 className="font-['Roboto'] font-bold text-dark-plum text-2xl sm:text-4xl md:text-[64px] leading-[44px] sm:leading-[64px] md:leading-[96px] text-center">
            Choose your role
          </h1>

          <div className="flex flex-col items-center gap-10 sm:gap-[65px] mt-16 sm:mt-[120px] w-full max-w-xs sm:max-w-md md:max-w-[573px]">
            <p className="font-heading font-[600] text-black text-base sm:text-lg md:text-xl text-center tracking-[0px] leading-[52px] font-normal">
              Do you want to sign up as
            </p>

            <div className="flex flex-row items-center gap-6 sm:gap-[95px] w-full justify-center">
              <Button
                variant="filled"
                className="h-10 sm:h-12 px-8 sm:px-20 py-[5px] rounded-lg bg-dark-plum text-white font-['Roboto'] font-bold text-xs sm:text-sm hover:bg-light-purple capitalize w-full sm:w-auto"
                onClick={() => {
                  window.location.href = "/startup-register";
                }}
              >
                Startup
              </Button>

              <Button
                variant="outlined"
                className="h-10 sm:h-12 px-8 sm:px-20 py-[5px] rounded-lg border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-xs sm:text-sm hover:bg-light-purple hover:text-white capitalize w-full sm:w-auto"
                onClick={() => {
                  window.location.href = "/investor-register";
                }}
              >
                Investor
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
