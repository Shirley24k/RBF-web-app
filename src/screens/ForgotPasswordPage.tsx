import { Button, Input, Spinner } from "@material-tailwind/react";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ForgotPassword = (): JSX.Element => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
        email
      });

      setSuccess(response.data.message || 'Password reset link has been sent to your email.');
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || 'Failed to send reset link. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fdfaf6] flex flex-row justify-center w-full min-h-screen">
      <div className="bg-beige overflow-x-hidden w-full max-w-[1512px] min-h-screen relative">
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
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center px-4 sm:px-0">
          {/* Heading */}
          <div className="flex flex-col w-full max-w-xs sm:max-w-md md:max-w-lg items-center gap-3 sm:gap-5 mb-6 sm:mb-10">
            <h1 className="font-heading font-[600] text-black text-2xl sm:text-3xl md:text-[45px] text-center tracking-[0] leading-[36px] sm:leading-[44px] md:leading-[52px]">
              Forgot Password
            </h1>
            <p className="font-['Roboto',Helvetica] font-normal text-[#79747e] text-base sm:text-lg md:text-2xl text-center tracking-[0] leading-6 sm:leading-8">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Form */}
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg border-none bg-transparent shadow-none p-0 space-y-4 sm:space-y-6">
            {error && (
              <div className="p-3 sm:p-4 mb-4 text-xs sm:text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 sm:p-4 mb-4 text-xs sm:text-sm text-green-700 bg-green-100 rounded-lg">
                {success}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="email"
                className="font-text-sm-font-medium font-[500] text-[#263238] text-xs sm:text-sm tracking-[0] leading-[150%]"
              >
                Your Email
              </Label>
              <Input
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 sm:h-12 px-2 sm:px-3 py-2 sm:py-3 rounded-lg bg-white border border-solid text-[#90a4ae] placeholder:text-[#90a4ae]"
              />
            </div>

            {/* Submit Button */}
            <Button
              className="w-full h-10 sm:h-12 bg-dark-plum hover:bg-dark-plum/90 text-white font-bold text-xs sm:text-sm rounded-lg capitalize hover:bg-light-purple disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <span
                onClick={() => navigate("/login")}
                className="text-dark-plum hover:text-light-purple cursor-pointer font-medium text-xs sm:text-sm"
              >
                Back to Login
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 