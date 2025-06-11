import { Button, Input, Option, Select } from "@material-tailwind/react";
import { Label } from "@radix-ui/react-label";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export const StartupRegister = (): JSX.Element => {
  const leftColumnFields = [
    { id: "fullName", label: "Full Name", placeholder: "Name" },
    { id: "companyName", label: "Company Name", placeholder: "Company Name" },
    {
      id: "companyAddress",
      label: "Company Address",
      placeholder: "Company Address",
    },
    { id: "password", label: "Password", placeholder: "Password" },
  ];

  const rightColumnFields = [
    { id: "email", label: "Business Email Address", placeholder: "Email" },
    {
      id: "confirmPassword",
      label: "Confirm Password",
      placeholder: "Confirm Password",
    },
  ];

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
        <main className="bg-beige flex flex-col items-center justify-start w-full min-h-screen">
          <div className="w-full max-w-[1512px] relative">
            <div className="flex flex-col items-center w-full max-w-[603px] gap-5 mx-auto">
              <h1 className="font-heading font-[600] text-black text-[45px] text-center tracking-[0] leading-[52px]">
                Sign Up
              </h1>

              <p className="font-['Roboto',Helvetica] font-normal text-[#79747e] text-2xl text-center tracking-[0] leading-8">
                Hi Startup! Register an account to get started now.
              </p>
            </div>

            <div className="flex flex-wrap gap-[99px] w-full p-[30px] mt-[50px] mb-[50px] justify-center">
              {/* Left Column */}
              <div className="flex flex-col gap-[30px] w-96">
                {leftColumnFields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <Label
                      htmlFor={field.id}
                      className="font-text-sm-font-medium text-blue-gray900"
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      label={field.placeholder}
                      className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    />
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-[30px] w-[390px]">
                {/* Mobile Number Field */}
                <div className="flex flex-col gap-2.5">
                  <Label
                    htmlFor="mobileNumber"
                    className="font-text-sm-font-medium text-blue-gray900"
                  >
                    Mobile Number
                  </Label>
                  <div className="flex h-10 items-center rounded-lg border border-blue-gray100 bg-white">
                    <div className="flex items-center h-8 px-1 py-2 gap-[5px] w-[77px]">
                      <span className="font-medium text-blue-gray500 text-xs leading-[18px] font-['Roboto',Helvetica] whitespace-nowrap">
                        +60
                      </span>
                      <ChevronDownIcon className="w-5 h-5 text-blue-gray500" />
                      <div className="w-px h-[25px] bg-blue-gray100" />
                    </div>
                    <Input
                      id="mobileNumber"
                      label="Mobile Number"
                      className="border-0 h-full px-0 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    />
                  </div>
                </div>

                {/* Company Sector Field */}
                <div className="flex flex-col gap-2.5">
                  <Label
                    htmlFor="companySector"
                    className="font-text-sm-font-medium text-blue-gray900"
                  >
                    Company Sector
                  </Label>
                  <div className="relative">
                    <Select
                      id="companySector"
                      className="bg-white text-blue-gray300"
                      label="Select your sector"
                    >
                      <Option>SaaS</Option>
                      <Option>FinTech</Option>
                      <Option>HealthTech</Option>
                      <Option>AI</Option>
                      <Option>EdTech</Option>
                    </Select>
                  </div>
                </div>

                {/* Email and Confirm Password Fields */}
                {rightColumnFields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <Label
                      htmlFor={field.id}
                      className="font-text-sm-font-medium text-blue-gray900"
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      label={field.placeholder}
                      className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col w-full max-w-[382px] items-start gap-2 mx-auto">
              <Button
                className="w-full h-12 bg-dark-plum text-white font-bold text-sm rounded-lg capitalize hover:bg-light-purple"
                onClick={() => {
                  window.location.href = "/login";
                }}
              >
                Sign Up
              </Button>

              <p className="w-full text-center text-sm font-normal">
                <span className="text-[#757575]">Already have an account?</span>
                <span className="font-medium text-[#757575]">&nbsp;</span>
                <span className="font-medium text-[#212121] cursor-pointer">
                  <a href="/login">Sign in here</a>
                </span>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
