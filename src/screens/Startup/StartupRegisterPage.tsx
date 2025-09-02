import { Button, Input, Option, Select, Spinner } from "@material-tailwind/react";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { useState } from "react";
import PhoneInput, { Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useNavigate } from "react-router-dom";
import { isValidPhoneNumber } from "../../lib/utils";
import { industryOptions } from "../../utils/industryOptions";

interface FormErrors {
  fullName?: string;
  companyName?: string;
  companyAddress?: string;
  password?: string;
  email?: string;
  confirmPassword?: string;
  mobileNumber?: string;
  companySector?: string;
}

export const StartupRegister = (): JSX.Element => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [companySector, setCompanySector] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>("MY");
  const [registrationError, setRegistrationError] = useState("");

  const validatePhoneNumber = (number: string, country: Country): boolean => {
    // Use our utility function for consistent validation
    return isValidPhoneNumber(number, country);
  };

  const validateField = (name: keyof FormErrors, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        return !value.trim() ? "Full name is required" : undefined;
      case 'companyName':
        return !value.trim() ? "Company name is required" : undefined;
      case 'companyAddress':
        return !value.trim() ? "Company address is required" : undefined;
      case 'email':
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
        return undefined;
      case 'password':
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return undefined;
      case 'confirmPassword':
        if (!value) return "Confirm password is required";
        if (value !== password) return "Passwords do not match";
        return undefined;
      case 'mobileNumber':
        if (!value) return "Mobile number is required";
        if (!validatePhoneNumber(value, selectedCountry)) return "Please enter a valid phone number";
        return undefined;
      case 'companySector':
        return !value ? "Company sector is required" : undefined;
      default:
        return undefined;
    }
  };

  const handleInputChange = (name: keyof FormErrors, value: string) => {
    // Update the field value
    switch (name) {
      case 'fullName': setFullName(value); break;
      case 'companyName': setCompanyName(value); break;
      case 'companyAddress': setCompanyAddress(value); break;
      case 'password': setPassword(value); break;
      case 'email': setEmail(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'mobileNumber': setMobileNumber(value); break;
      case 'companySector': setCompanySector(value); break;
    }

    // Validate the field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // If this is password change, also validate confirm password
    if (name === 'password' && confirmPassword) {
      const confirmError = validateField('confirmPassword', confirmPassword);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    const fields: (keyof FormErrors)[] = [
      'fullName', 'companyName', 'companyAddress', 'email',
      'password', 'confirmPassword', 'mobileNumber', 'companySector'
    ];

    fields.forEach(field => {
      const value = field === 'companySector' ? companySector :
        field === 'fullName' ? fullName :
        field === 'companyName' ? companyName :
        field === 'companyAddress' ? companyAddress :
        field === 'password' ? password :
        field === 'email' ? email :
        field === 'confirmPassword' ? confirmPassword :
        mobileNumber;

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
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setRegistrationError("");
    try {
      const formData = {
        name: fullName,
        contact_no: mobileNumber,
        company_name: companyName,
        company_sector: companySector,
        company_address: companyAddress,
        email,
        password,
      };

      const response = await axios.post(`${API_BASE_URL}/register/startup`, formData);
      if (response.status === 201) {
        alert("Please verify your email before logging in.");
        navigate("/login");
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 422 &&
        error.response.data &&
        error.response.data.errors
      ) {
        const errors = error.response.data.errors;
        if (
          (errors.contact_no && errors.contact_no[0].includes("not eligible")) ||
          (errors.company_address && errors.company_address[0].includes("not eligible"))
        ) {
          setRegistrationError(`We are sorry, but you are not eligible to use our platform. 
    We currently only accept startups that are based in Malaysia. 
    If your company is based in Malaysia, please ensure that your contact number and company 
    address is complete and accurate in your profile. 
    For further assistance, feel free to contact us at rbfsupport@gmail.com.`);
          return;
        }
      } else {
        setRegistrationError("Registration failed. Please check your details and try again.");
      }
    } finally {
      setIsSubmitting(false); 
    }
  };

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
            className="h-12 px-6 py-[5px] rounded-lg border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm hover:bg-light-purple hover:border-none hover:text-white capitalize"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </header>

        {/* Main Content */}
        <main className="bg-beige flex flex-col items-center justify-start w-full min-h-screen pb-20">
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
              {registrationError && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg w-[1000px] text-center">
                  {registrationError}
                </div>
              )}
              {/* Left Column */}
              <div className="flex flex-col gap-[30px] w-96">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName" className="font-text-sm-font-medium text-blue-gray900">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    label="Name"
                    value={fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    error={!!errors.fullName}
                  />
                  {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="companyName" className="font-text-sm-font-medium text-blue-gray900">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    error={!!errors.companyName}
                  />
                  {errors.companyName && <span className="text-red-500 text-sm">{errors.companyName}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="companyAddress" className="font-text-sm-font-medium text-blue-gray900">
                    Company Address
                  </Label>
                  <Input
                    id="companyAddress"
                    label="Company Address"
                    value={companyAddress}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    error={!!errors.companyAddress}
                  />
                  {errors.companyAddress && <span className="text-red-500 text-sm">{errors.companyAddress}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="font-text-sm-font-medium text-blue-gray900">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    error={!!errors.password}
                  />
                  {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-[30px] w-[390px]">
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="mobileNumber" className="font-text-sm-font-medium text-blue-gray900">
                    Mobile Number
                  </Label>
                  <div className="flex h-10 items-center rounded-lg border border-blue-gray100 bg-white">
                    <PhoneInput
                      international
                      defaultCountry="MY"
                      value={mobileNumber}
                      onChange={(value) => handleInputChange('mobileNumber', value || '')}
                      onCountryChange={(country) => setSelectedCountry(country || 'MY')}
                      className="w-full h-full"
                      error={!!errors.mobileNumber}
                    />
                  </div>
                  {errors.mobileNumber && <span className="text-red-500 text-sm">{errors.mobileNumber}</span>}
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="companySector" className="font-text-sm-font-medium text-blue-gray900">
                    Company Sector
                  </Label>
                  <div className="relative">
                    <Select
                      id="companySector"
                      className="bg-white text-blue-gray300"
                      label="Select your sector"
                      value={companySector}
                      onChange={(value) => handleInputChange('companySector', value as string)}
                      error={!!errors.companySector}
                    >
                      {industryOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  {errors.companySector && <span className="text-red-500 text-sm">{errors.companySector}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="font-text-sm-font-medium text-blue-gray900">
                    Business Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    error={!!errors.email}
                  />
                  {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword" className="font-text-sm-font-medium text-blue-gray900">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    error={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full max-w-[382px] items-start gap-2 mx-auto">
              <Button
                className="w-full h-12 bg-dark-plum text-white font-bold text-sm rounded-lg capitalize hover:bg-light-purple disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="h-5 w-5" />
                  </div>
                ) : (
                  "Sign Up"
                )}
              </Button>

              <p className="w-full text-center text-sm font-normal">
                <span className="text-[#757575]">Already have an account?</span>
                <span className="font-medium text-[#757575]">&nbsp;</span>
                <span className="font-medium text-[#212121] cursor-pointer">
                  <a onClick={() => navigate("/login")}>Sign in here</a>
                </span>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
