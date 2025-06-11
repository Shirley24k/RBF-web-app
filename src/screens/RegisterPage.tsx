import { Button } from "@material-tailwind/react";

export const Register = (): JSX.Element => {
  return (
    <div className="bg-beige flex flex-row justify-center w-full min-h-screen">
      <div className="w-full max-w-[1512px] relative">
        {/* Header */}
        <header className="w-full h-[164px] flex items-center justify-between px-20">
          <div className="font-['Irish_Grover'] font-normal text-5xl leading-[72px]">
            <span className="text-[#073b1d]">R</span>
            <span className="text-[#574964c7]">B</span>
            <span className="text-[#073b1d]">F</span>
          </div>

          <Button
            variant="outlined"
            className="h-12 px-6 py-[5px] rounded-lg border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm hover:bg-light-purple hover:text-white capitalize"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Home
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center mt-10">
          <h1 className="font-['Roboto'] font-bold text-dark-plum text-[64px] leading-[96px] text-center">
            Choose your role
          </h1>

          <div className="flex flex-col items-center gap-[65px] mt-[120px] max-w-[573px]">
            <p className="font-heading font-[number:var(--heading-font-weight)] text-black text-[length:var(--heading-font-size)] text-center tracking-[var(--heading-letter-spacing)] leading-[var(--heading-line-height)] [font-style:var(--heading-font-style)]">
              Do you want to sign up as
            </p>

            <div className="flex items-center gap-[95px]">
              <Button
                variant="filled"
                className="h-12 px-20 py-[5px] rounded-lg bg-dark-plum text-white font-['Roboto'] font-bold text-sm hover:bg-light-purple capitalize"
                onClick={() => {
                  window.location.href = "/startup-register";
                }}
              >
                Startup
              </Button>

              <Button
                variant="outlined"
                className="h-12 px-20 py-[5px] rounded-lg border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm hover:bg-light-purple hover:text-white capitalize"
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
