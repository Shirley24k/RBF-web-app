import { Button, Input, Spinner } from "@material-tailwind/react";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      });

      if (response.data.success) {
        // Store the token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Check if stripe is linked
        if(response.data.user.role === "startup" || response.data.user.role === "investor" || response.data.user.role === "staff"){
          let endpoint;
          if (response.data.user.role === "startup" || response.data.user.role === "staff") {
            endpoint = "startup/profile";
          } else {
            endpoint = "investor/profile";
          }
          
          await axios.get(`${API_BASE_URL}/${endpoint}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          .then((response) => {
            if (response.data?.data?.stripe_id){
              localStorage.setItem('isStripeLinked', 'true');
            } else {
              localStorage.setItem('isStripeLinked', 'false');
            }
          })
          .catch((error) => {
            console.error('Error fetching profile for Stripe check:', error);
          });
        } 
        // Redirect based on role
        if (response.data.user.role === 'staff') {
          // Staff members should access startup features
          navigate('/startup-home');
        } else {
          navigate(`/${response.data.user.role}-home`);
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      if (error.response) {
        // Handle specific error cases
        if (error.response.status === 401) {
          setError('Invalid email or password');
        } else if (error.response.status === 403) {
          setError('Your account is not activated. Please check your email for verification.');
        } else {
          setError(error.response.data.message || 'An error occurred during login');
        }
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
        <header className="w-full flex items-center justify-between px-20 max-md:px-8 max-sm:px-4 h-[164px] max-md:h-[120px] max-sm:h-20">
          <div className="font-['Irish_Grover'] font-normal text-5xl max-md:text-4xl max-sm:text-2xl leading-[72px] max-md:leading-[64px] max-sm:leading-[48px]">
            <span className="text-[#073b1d]">R</span>
            <span className="text-[#574964c7]">B</span>
            <span className="text-[#073b1d]">F</span>
          </div>

          <Button
            variant="outlined"
            className="h-12 max-md:h-10 max-sm:h-8 px-6 max-md:px-4 max-sm:px-3 py-[5px] rounded-lg border border-solid border-light-purple [font-family:'Roboto',Helvetica] font-bold text-dark-plum text-sm max-md:text-xs bg-transparent hover:bg-light-purple hover:text-white capitalize"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center px-0 max-md:px-4">
          {/* Heading */}
          <div className="flex flex-col w-full max-w-lg max-md:max-w-md max-sm:max-w-xs items-center gap-5 max-md:gap-3 mb-10 max-md:mb-6">
            <h1 className="font-heading font-[600] text-black text-[45px] max-md:text-3xl max-sm:text-2xl text-center tracking-[0] leading-[52px] max-md:leading-[44px] max-sm:leading-[36px]">
              Sign In
            </h1>
            <p className="font-['Roboto',Helvetica] font-normal text-[#79747e] text-2xl max-md:text-lg max-sm:text-base text-center tracking-[0] leading-8 max-md:leading-6">
              Enter your email and password to sign in
            </p>
          </div>

          {/* Login Form */}
          <div className="w-full max-w-lg max-md:max-w-md max-sm:max-w-xs border-none bg-transparent shadow-none p-0 space-y-6 max-md:space-y-4">
            {error && (
              <div className="p-4 max-md:p-3 mb-4 text-sm max-md:text-xs text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2 max-md:space-y-1">
              <Label
                htmlFor="email"
                className="font-text-sm-font-medium font-[500] text-[#263238] text-sm max-md:text-xs tracking-[0] leading-[150%]"
              >
                Your Email
              </Label>
              <Input
                id="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 max-md:h-10 max-sm:h-8 px-3 max-md:px-2 py-3 max-md:py-2 rounded-lg bg-white border border-solid text-[#90a4ae] placeholder:text-[#90a4ae]"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 max-md:space-y-1">
              <Label
                htmlFor="password"
                className="font-text-sm-font-medium font-[500] text-[#263238] text-sm max-md:text-xs tracking-[0] leading-[150%]"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 max-md:h-10 max-sm:h-8 px-3 max-md:px-2 py-3 max-md:py-2 rounded-lg bg-white border border-solid text-[#90a4ae] placeholder:text-[#90a4ae]"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-end flex-wrap gap-2">
              <p 
                onClick={() => navigate("/forgot-password")}
                className="font-['Roboto',Helvetica] font-medium text-gray-600 text-sm max-md:text-xs p-0 h-auto cursor-pointer hover:text-dark-plum"
              >
                Forgot password
              </p>
            </div>

            {/* Sign In Button */}
            <Button
              className="w-full h-12 max-md:h-10 max-sm:h-8 bg-dark-plum hover:bg-dark-plum/90 text-white font-bold text-sm max-md:text-xs rounded-lg capitalize hover:bg-light-purple disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => login(email, password)}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Create Account Link */}
            <div className="text-center font-['Roboto',Helvetica] font-normal text-gray-600 text-sm max-md:text-xs tracking-[0] leading-[21px]">
              <span className="text-[#757575]">Not registered?</span>
              <span className="font-medium text-[#757575]">&nbsp;</span>
              <span
                onClick={() => navigate("/register")}
                className="p-0 h-auto font-medium text-[#212121] capitalize text-sm max-md:text-xs cursor-pointer hover:text-dark-plum"
              >
                Create account
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
