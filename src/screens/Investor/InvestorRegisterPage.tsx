import { Input, Option, Radio, Select } from "@material-tailwind/react";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { CountryCode, getCountries } from 'libphonenumber-js';
import { useState } from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import { isValidPhoneNumber } from "../../lib/utils";
import { fundingStageOptions, getFundingStageLabel } from "../../utils/fundingStage";
import { industryOptions } from "../../utils/industryOptions";
import { investmentAmountOptions } from "../../utils/investmentAmountRange";

interface FormErrors {
  fullName?: string;
  companyName?: string;
  companyAddress?: string;
  password?: string;
  email?: string;
  confirmPassword?: string;
  mobileNumber?: string;
  country?: string;
  preferredIndustries?: string;
  fundingStages?: string;
  investmentRange?: string;
  revenueShare?: string;
  submit?: string;
}

export const InvestorRegister = (): JSX.Element => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [investorType, setInvestorType] = useState("individual");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [country, setCountry] = useState<string>("Malaysia");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFundingStages, setSelectedFundingStages] = useState<string[]>([]);
  const [investmentRange, setInvestmentRange] = useState("");
  const [revenueShare, setRevenueShare] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("MY");

  
  // Get list of countries from libphonenumber-js
  const countries = getCountries();

  // Function to get country name from country code
  const getCountryName = (countryCode: CountryCode): string => {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(countryCode) || countryCode;
  };

  // Function to get country code from country name
  const getCountryCode = (countryName: string): CountryCode | undefined => {
    return countries.find(code => getCountryName(code) === countryName);
  };

  const validatePhoneNumber = (number: string, country: CountryCode): boolean => {
    // Use our utility function for consistent validation
    return isValidPhoneNumber(number, country);
  };

  // Add handleCountryChange function
  const handleCountryChange = (value: string) => {
    setCountry(value);
    const countryCode = getCountryCode(value);
    if (countryCode) {
      setSelectedCountry(countryCode);
      const error = validateField("country", value);
      setErrors(prev => ({ ...prev, country: error }));
    }
  };

  const validateField = (name: keyof FormErrors, value: string | string[]): string | undefined => {
    switch (name) {
      case 'fullName':
        return !value.toString().trim() ? "Full name is required" : undefined;
      case 'companyName':
        return !value.toString().trim() ? "Company name is required" : undefined;
      case 'companyAddress':
        return !value.toString().trim() ? "Company address is required" : undefined;
      case 'email':
        if (!value.toString().trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value.toString())) return "Email is invalid";
        return undefined;
      case 'password':
        if (!value.toString()) return "Password is required";
        if (value.toString().length < 8) return "Password must be at least 8 characters";
        return undefined;
      case 'confirmPassword':
        if (!value.toString()) return "Confirm password is required";
        if (value.toString() !== password) return "Passwords do not match";
        return undefined;
      case 'mobileNumber':
        if (!value.toString()) return "Mobile number is required";
        if (!validatePhoneNumber(value.toString(), selectedCountry)) return "Please enter a valid phone number";
        return undefined;
      case 'country':
        return !value.toString() ? "Country is required" : undefined;
      case 'preferredIndustries':
        return (value as string[]).length === 0 ? "Please select at least one industry" : undefined;
      case 'fundingStages':
        return (value as string[]).length === 0 ? "Please select at least one funding stage" : undefined;
      case 'investmentRange':
        return !value.toString() ? "Investment range is required" : undefined;
      case 'revenueShare':
        if (!value.toString()) return "Revenue share is required";
        const share = parseFloat(value.toString());
        if (isNaN(share) || share < 0 || share > 100) return "Please enter a valid percentage (0-100)";
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    const fields: (keyof FormErrors)[] = [
      'fullName', 'companyName', 'companyAddress', 'email',
      'password', 'confirmPassword', 'mobileNumber', 'country',
      'preferredIndustries', 'fundingStages', 'investmentRange', 'revenueShare'
    ];

    fields.forEach(field => {
      const value = field === 'preferredIndustries' ? selectedIndustries :
        field === 'fundingStages' ? selectedFundingStages :
        field === 'fullName' ? fullName :
        field === 'companyName' ? companyName :
        field === 'companyAddress' ? companyAddress :
        field === 'password' ? password :
        field === 'email' ? email :
        field === 'confirmPassword' ? confirmPassword :
        field === 'mobileNumber' ? mobileNumber :
        field === 'country' ? country :
        field === 'investmentRange' ? investmentRange :
        revenueShare;

      // Skip validation for fields that don't apply to the current investor type
      if (investorType === "individual" && (field === "companyName" || field === "companyAddress")) {
        return;
      }
      if (investorType === "firm" && field === "fullName") {
        return;
      }

      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = {
        type: investorType,
        name: investorType === "individual" ? fullName : companyName,
        contact_no: mobileNumber,
        company_address: investorType === "firm" ? companyAddress : undefined,
        country: investorType === "individual" ? country : undefined,
        email,
        password,
        investment_preferences: {
          preferred_industry: selectedIndustries,
          preferred_funding_stage: selectedFundingStages,
          investment_amount_range: investmentRange,
          revenue_share_percentage: parseFloat(revenueShare)
        }
      };

      // Create investor record in database
      const response = await axios.post(`${API_BASE_URL}/register/investor`, formData);

      if (response.status === 201) {
        alert("Please verify your email before logging in.");
        navigate("/login");
      }
       
    } catch (error: any) {
      if (error.response) {
        // Handle validation errors from backend
        if (error.response.status === 422) {
          const backendErrors = error.response.data.errors;
          if (backendErrors) {
            // Convert backend errors to frontend error format
            const newErrors: FormErrors = {};
            Object.keys(backendErrors).forEach(key => {
              // Map backend field names to frontend field names
              const frontendKey = key === 'contact_no' ? 'mobileNumber' :
                                key === 'investment_preferences.preferred_industry' ? 'preferredIndustries' :
                                key === 'investment_preferences.preferred_funding_stage' ? 'fundingStages' :
                                key === 'investment_preferences.investment_amount_range' ? 'investmentRange' :
                                key === 'investment_preferences.revenue_share_percentage' ? 'revenueShare' :
                                key;
              newErrors[frontendKey as keyof FormErrors] = backendErrors[key][0];
            });
            setErrors(prev => ({ ...prev, ...newErrors }));
          } else {
            const errorMessage = error.response.data.message;
            if (errorMessage.includes('SCM investor alert list')) {
              setErrors(prev => ({
                ...prev,
                submit: "We have found you in the SCM investor alert list. Your registration cannot be processed at this time. For further assistance, feel free to contact us at rbf@gmail.com."
              }));
            } else {
              setErrors(prev => ({
                ...prev,
                submit: errorMessage || "Invalid form data. Please check your inputs."
              }));
            }
          }
        } else if (error.response.status === 409) {
          setErrors(prev => ({
            ...prev,
            email: "Email already exists. Please use a different email."
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            submit: "Registration failed. Please try again later."
          }));
        }
      } else if (error.request) {
        setErrors(prev => ({
          ...prev,
          submit: "No response from server. Please check your internet connection."
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          submit: "An error occurred. Please try again."
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <AppButton
            variant="outline"
            size="lg"
            onClick={() => navigate("/")}
          >
            Home
          </AppButton>
        </header>

        <div className="flex flex-col items-center w-full max-w-[603px] gap-5 mx-auto">
          <h1 className="w-full font-heading font-[600] text-black text-[45px] text-center tracking-[0px] leading-[52px] font-normal">
            Sign Up
          </h1>

          <p className="w-full font-['Roboto',Helvetica] font-normal text-[#79747e] text-2xl text-center tracking-[0] leading-8">
            Hi Investor! Register an account to get started now.
          </p>
        </div>

        <div className="w-full max-w-[854px] mx-auto">
          {errors.submit && (
              <div className="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg text-center">
                {errors.submit}
              </div>
            )}
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
            {/* Individual/Firm Fields */}
            {investorType === "individual" ? (
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="fullName"
                  className="font-text-sm-font-medium text-blue-gray900"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  label="Name"
                  value={fullName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFullName(value);
                    const error = validateField("fullName", value);
                    setErrors(prev => ({ ...prev, fullName: error }));
                  }}
                  className="h-10 px-3 py-3 bg-white border-[#cfd8dc] text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  error={!!errors.fullName}
                />
                {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName}</span>}
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="companyName"
                  className="font-text-sm-font-medium text-blue-gray900"
                >
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCompanyName(value);
                    const error = validateField("companyName", value);
                    setErrors(prev => ({ ...prev, companyName: error }));
                  }}
                  className="h-10 px-3 py-3 bg-white border-[#cfd8dc] text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  error={!!errors.companyName}
                />
                {errors.companyName && <span className="text-red-500 text-sm">{errors.companyName}</span>}
              </div>
            )}

            {/* Mobile Number - Common for both types */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="mobileNumber"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                Mobile Number
              </Label>
              <div className="flex h-10 items-center rounded-lg border border-[#cfd8dc] bg-white">
                <PhoneInput
                  international
                  defaultCountry="MY"
                  value={mobileNumber}
                  onChange={(value) => {
                    setMobileNumber(value || "");
                    const error = validateField("mobileNumber", value || "");
                    setErrors(prev => ({ ...prev, mobileNumber: error }));
                  }}
                  onCountryChange={(country) => {
                    setSelectedCountry(country || "MY");
                    const error = validateField("mobileNumber", mobileNumber);
                    setErrors(prev => ({ ...prev, mobileNumber: error }));
                  }}
                  className="w-full h-full"
                  error={!!errors.mobileNumber}
                />
              </div>
              {errors.mobileNumber && <span className="text-red-500 text-sm">{errors.mobileNumber}</span>}
            </div>

            {/* Country/Address Field */}
            {investorType === "individual" ? (
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="country"
                  className="font-text-sm-font-medium text-blue-gray900"
                >
                  Country
                </Label>
                <Select
                  label="Select country"
                  className="bg-white"
                  value={country}
                  onChange={(value) => handleCountryChange(value as string)}
                  error={!!errors.country}
                >
                  {countries.map((countryCode) => (
                    <Option 
                      key={countryCode} 
                      value={getCountryName(countryCode)}
                      className="hover:bg-gray-100"
                    >
                      {getCountryName(countryCode)}
                    </Option>
                  ))}
                </Select>
                {errors.country && <span className="text-red-500 text-sm">{errors.country}</span>}
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="companyAddress"
                  className="font-text-sm-font-medium text-blue-gray900"
                >
                  Company Address
                </Label>
                <Input
                  id="companyAddress"
                  type="text"
                  label="Company Address"
                  value={companyAddress}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCompanyAddress(value);
                    const error = validateField("companyAddress", value);
                    setErrors(prev => ({ ...prev, companyAddress: error }));
                  }}
                  className="h-10 px-3 py-3 bg-white border-[#cfd8dc] text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  error={!!errors.companyAddress}
                />
                {errors.companyAddress && <span className="text-red-500 text-sm">{errors.companyAddress}</span>}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="email"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                {investorType === "individual" ? "Email Address" : "Business Email Address"}
              </Label>
              <Input
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  const error = validateField("email", value);
                  setErrors(prev => ({ ...prev, email: error }));
                }}
                className="h-10 px-3 py-3 bg-white border-[#cfd8dc] text-blue-gray300 font-leading-tight-text-sm-font-normal"
                error={!!errors.email}
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="password"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  const error = validateField("password", value);
                  setErrors(prev => ({ ...prev, password: error }));
                  // Also validate confirm password if it exists
                  if (confirmPassword) {
                    const confirmError = validateField("confirmPassword", confirmPassword);
                    setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
                  }
                }}
                className="h-10 px-3 py-3 bg-white border-[#cfd8dc] text-blue-gray300 font-leading-tight-text-sm-font-normal"
                error={!!errors.password}
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="font-text-sm-font-medium text-blue-gray900"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmPassword(value);
                  const error = validateField("confirmPassword", value);
                  setErrors(prev => ({ ...prev, confirmPassword: error }));
                }}
                className="h-10 px-3 py-3 bg-white border-[#cfd8dc] text-blue-gray300 font-leading-tight-text-sm-font-normal"
                error={!!errors.confirmPassword}
              />
              {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
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
                error={!!errors.preferredIndustries}
              >
                {industryOptions.map(
                  (industry) => (
                    <Option
                      key={industry.value}
                      onClick={() => {
                        const newIndustries = selectedIndustries.includes(industry.value)
                          ? selectedIndustries.filter((item) => item !== industry.value)
                          : [...selectedIndustries, industry.value];
                        setSelectedIndustries(newIndustries);
                        const error = validateField("preferredIndustries", newIndustries);
                        setErrors(prev => ({ ...prev, preferredIndustries: error }));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIndustries.includes(industry.value)}
                          readOnly
                        />
                        {industry.label}
                      </div>
                    </Option>
                  )
                )}
              </Select>
              {errors.preferredIndustries && (
                <span className="text-red-500 text-sm">{errors.preferredIndustries}</span>
              )}
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
                value={investmentRange}
                onChange={(value) => {
                  setInvestmentRange(value as string);
                  const error = validateField("investmentRange", value as string);
                  setErrors(prev => ({ ...prev, investmentRange: error }));
                }}
                error={!!errors.investmentRange}
              >
                {investmentAmountOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
              {errors.investmentRange && (
                <span className="text-red-500 text-sm">{errors.investmentRange}</span>
              )}
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
                          {getFundingStageLabel(item)}
                        </span>
                      ))
                    : "Select preferred funding stages"
                }
                onChange={() => {}}
                className="bg-white"
                error={!!errors.fundingStages}
              >
                {fundingStageOptions.map((stage) => (
                  <Option
                    key={stage.value}
                    onClick={() => {
                      const newStages = selectedFundingStages.includes(stage.value)
                        ? selectedFundingStages.filter((item) => item !== stage.value)
                        : [...selectedFundingStages, stage.value];
                      setSelectedFundingStages(newStages);
                      const error = validateField("fundingStages", newStages);
                      setErrors(prev => ({ ...prev, fundingStages: error }));
                    }}
                  >
                    <div className="flex items-center gap-2 capitalize">
                      <input
                        type="checkbox"
                        checked={selectedFundingStages.includes(stage.value)}
                        readOnly
                      />
                      {stage.label}
                    </div>
                  </Option>
                ))}
              </Select>
              {errors.fundingStages && (
                <span className="text-red-500 text-sm">{errors.fundingStages}</span>
              )}
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
                value={revenueShare}
                onChange={(e) => {
                  const value = e.target.value;
                  setRevenueShare(value);
                  const error = validateField("revenueShare", value);
                  setErrors(prev => ({ ...prev, revenueShare: error }));
                }}
                className="bg-white"
                error={!!errors.revenueShare}
              />
              {errors.revenueShare && (
                <span className="text-red-500 text-sm">{errors.revenueShare}</span>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col w-full max-w-[382px] items-center gap-2 mx-auto">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
              Sign Up
          </AppButton>

          <p className="text-sm text-center font-roboto">
            <span className="text-[#757575]">Already have an account?</span>
            <span className="font-medium text-[#757575]">&nbsp;</span>
            <span className="font-medium text-[#212121] cursor-pointer">
              <a onClick={() => navigate("/login")}>Sign in here</a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
