import { Button, Input, Option, Radio, Select } from "@material-tailwind/react";
import { Label } from "@radix-ui/react-label";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export const InvestorRegister = (): JSX.Element => {
  const [investorType, setInvestorType] = useState("individual");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFundingStages, setSelectedFundingStages] = useState<string[]>(
    []
  );

  const toggleMultiSelect = (
    value: string,
    selected: string[],
    setSelected: (val: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const individualFields = [
    {
      id: "fullName",
      label: "Full Name",
      placeholder: "Name",
    },
    {
      id: "country",
      label: "Country",
      type: "select",
      placeholder: "Select country",
    },
    {
      id: "email",
      label: "Email Address",
      type: "text",
      placeholder: "Email",
    },
    {
      id: "password",
      label: "Password",
      type: "text",
      placeholder: "Password",
    },
    {
      id: "confirmPassword",
      label: "Confirm Password",
      type: "text",
      placeholder: "Confirm Password",
    },
  ];

  const firmFields = [
    {
      id: "companyName",
      label: "Company Name",
      placeholder: "Name",
    },
    {
      id: "companyAddress",
      label: "Company Address",
      placeholder: "Company Address",
    },
    {
      id: "businessEmail",
      label: "Business Email Address",
      type: "text",
      placeholder: "Email",
    },
    {
      id: "password",
      label: "Password",
      type: "text",
      placeholder: "Password",
    },
    {
      id: "confirmPassword",
      label: "Confirm Password",
      type: "text",
      placeholder: "Confirm Password",
    },
  ];

  const currentFields =
    investorType === "individual" ? individualFields : firmFields;

  return (
    <div className="bg-beige flex flex-col items-center w-full min-h-screen pb-20">
      <div className="w-full max-w-[1512px] flex flex-col">
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

        <div className="flex flex-col items-center w-full max-w-[603px] gap-5 mx-auto">
          <h1 className="w-full font-heading font-[number:var(--heading-font-weight)] text-black text-[length:var(--heading-font-size)] text-center tracking-[var(--heading-letter-spacing)] leading-[var(--heading-line-height)] [font-style:var(--heading-font-style)]">
            Sign Up
          </h1>

          <p className="w-full font-['Roboto',Helvetica] font-normal text-[#79747e] text-2xl text-center tracking-[0] leading-8">
            Hi Investor! Register an account to get started now.
          </p>
        </div>

        <div className="w-full max-w-[854px] mx-auto">
          {/* Investor Type Selection */}
          <div className="flex justify-center mb-10">
            <div className="flex gap-8">
              <Radio
                name="investorType"
                label="Individual investor"
                value="individual"
                checked={investorType === "individual"}
                onChange={() => setInvestorType("individual")}
                className="text-dark-plum"
                labelProps={{
                  className: "font-medium",
                }}
              />
              <Radio
                name="investorType"
                label="Investment firm"
                value="firm"
                checked={investorType === "firm"}
                onChange={() => setInvestorType("firm")}
                className="text-dark-plum"
                labelProps={{
                  className: "font-medium",
                }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Dynamic Form Fields */}
            {currentFields.map((field) => (
              <div key={field.id} className="flex flex-col space-y-2">
                <Label
                  htmlFor={field.id}
                  className="font-text-sm-font-medium text-blue-gray900"
                >
                  {field.label}
                </Label>
                {field.type === "select" ? (
                  <Select label={field.placeholder} className="bg-white">
                    <Option className="hover:bg-gray-100" value="malaysia">
                      Malaysia
                    </Option>
                    <Option className="hover:bg-gray-100" value="singapore">
                      Singapore
                    </Option>
                    <Option className="hover:bg-gray-100" value="indonesia">
                      Indonesia
                    </Option>
                  </Select>
                ) : (
                  <Input
                    id={field.id}
                    type={field.type || "text"}
                    label={field.placeholder}
                    className="h-10 px-3 py-3 bg-white border-[#cfd8dc] text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  />
                )}
              </div>
            ))}

            {/* Mobile Number - Common for both types */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="mobileNumber"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                Mobile Number
              </Label>
              <div className="flex h-10 items-center border border-[#cfd8dc] rounded-lg bg-white overflow-hidden">
                <div className="flex items-center h-full border-r border-blue-gray100">
                  <div className="flex items-center px-1 h-8 space-x-1">
                    <span className="text-xs font-medium text-blue-gray500">
                      +60
                    </span>
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
                </div>
                <Input
                  id="mobileNumber"
                  label="Mobile Number"
                  className="h-full border-none shadow-none text-blue-gray300 font-leading-tight-text-sm-font-normal"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="w-full max-w-[877px] mx-auto my-8">
          <h3 className="font-medium text-sm text-black underline font-['Roboto',Helvetica] mb-6">
            Investment Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-[75px]">
            {/* Preferred Industry - Multi Select */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="industry"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                Preferred Industry
              </Label>
              <Select
                label=""
                selected={() =>
                  selectedIndustries.length > 0
                    ? selectedIndustries.map((item) => (
                        <span
                          key={item}
                          className="inline-block bg-blue-gray-100 text-blue-gray-800 text-xs px-2 py-1 rounded-full mr-1"
                        >
                          {item}
                        </span>
                      ))
                    : "Select preferred industries"
                }
                onChange={() => {}}
                className="bg-white"
              >
                {["FinTech", "HealthTech", "AgriTech", "EdTech", "SaaS"].map(
                  (industry) => (
                    <Option
                      key={industry}
                      onClick={() =>
                        toggleMultiSelect(
                          industry,
                          selectedIndustries,
                          setSelectedIndustries
                        )
                      }
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIndustries.includes(industry)}
                          readOnly
                        />
                        {industry}
                      </div>
                    </Option>
                  )
                )}
              </Select>
            </div>

            {/* Investment Amount Range */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="investmentRange"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                Investment Amount Range
              </Label>
              <Select
                id="investmentRange"
                className="bg-white"
                label="Select range"
              >
                <Option className="hover:bg-gray-100">Less than RM500k</Option>
                <Option className="hover:bg-gray-100">RM500k - RM2000k</Option>
                <Option className="hover:bg-gray-100">More than RM2000k</Option>
              </Select>
            </div>

            {/* Funding Stage - Multi Select */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="fundingStage"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                Funding Stage
              </Label>
              <Select
                label=""
                selected={() =>
                  selectedFundingStages.length > 0
                    ? selectedFundingStages.map((item) => (
                        <span
                          key={item}
                          className="inline-block bg-blue-gray-100 text-blue-gray-800 text-xs px-2 py-1 rounded-full mr-1"
                        >
                          {item}
                        </span>
                      ))
                    : "Select preferred funding stages"
                }
                onChange={() => {}}
                className="bg-white"
              >
                {["Seed", "Series A", "Series B"].map((stage) => (
                  <Option
                    key={stage}
                    onClick={() =>
                      toggleMultiSelect(
                        stage,
                        selectedFundingStages,
                        setSelectedFundingStages
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFundingStages.includes(stage)}
                        readOnly
                      />
                      {stage}
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            {/* Revenue Share Percentage */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="revenueShare"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                Revenue Share Percentage
              </Label>
              <Input
                type="number"
                id="revenueShare"
                label="Enter revenue share %"
                className="bg-white"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col w-full max-w-[382px] items-center gap-2 mx-auto">
          <Button
            className="w-full h-12 bg-dark-plum hover:bg-light-purple text-white font-bold text-sm rounded-lg capitalize"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Sign Up
          </Button>

          <p className="text-sm text-center font-roboto">
            <span className="text-[#757575]">Already have an account?</span>
            <span className="font-medium text-[#757575]">&nbsp;</span>
            <span className="font-medium text-[#212121] cursor-pointer">
              <a href="/login">Sign in here</a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
