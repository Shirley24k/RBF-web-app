import { Button, Checkbox, Input, Typography } from "@material-tailwind/react";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

export const Login = (): JSX.Element => {
  function login(email: string, password: string) {
    const users = [
      { email: "admin@gmail.com", password: "admin123", role: "admin" },
      {
        email: "investor@gmail.com",
        password: "investor123",
        role: "investor",
      },
      { email: "startup@gmail.com", password: "startup123", role: "startup" },
    ];

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      return {
        success: true,
        role: user.role,
      };
    } else {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="bg-[#fdfaf6] flex flex-row justify-center w-full">
      <div className="bg-beige overflow-x-hidden w-full max-w-[1512px] min-h-screen relative">
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
        <main className="flex flex-col items-center">
          {/* Heading */}
          <div className="flex flex-col w-[435px] items-center gap-5 mb-10">
            <h1 className="font-heading font-[600] text-black text-[45px] text-center tracking-[0] leading-[52px]">
              Sign In
            </h1>
            <p className="font-['Roboto',Helvetica] font-normal text-[#79747e] text-2xl text-center tracking-[0] leading-8">
              Enter your email and password to sign in
            </p>
          </div>

          {/* Login Form */}
          <div className="w-[382px] border-none bg-transparent shadow-none p-0 space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-text-sm-font-medium font-[500] text-[#263238] text-[14px] tracking-[0] leading-[150%]"
              >
                Your Email
              </Label>
              <Input
                id="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-3 py-3 rounded-lg bg-white border border-solid text-[#90a4ae] placeholder:text-[#90a4ae]"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-text-sm-font-medium font-[500] text-[#263238] text-[14px] tracking-[0] leading-[150%]"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 px-3 py-3 rounded-lg bg-white border border-solid text-[#90a4ae] placeholder:text-[#90a4ae]"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  label={
                    <Typography className="font-normal text-md">
                      Remember Me
                    </Typography>
                  }
                  className="w-[18px] h-[18px] rounded border border-solid border-black"
                />
              </div>
              <p className="font-['Roboto',Helvetica] font-medium text-gray-600 text-sm p-0 h-auto">
                Forgot password
              </p>
            </div>

            {/* Sign In Button */}
            <a href="/startup-home"></a>
            <Button
              className="w-full h-12 bg-dark-plum hover:bg-dark-plum/90 text-white font-bold text-sm rounded-lg capitalize hover:bg-light-purple"
              onClick={() => {
                const result = login(email, password);
                if (result.success) {
                  if (result.role) {
                    localStorage.setItem("role", result.role);
                  }
                  window.location.href = `/${result.role}-home`;
                }
              }}
            >
              Sign In
            </Button>

            {/* Create Account Link */}
            <div className="text-center font-['Roboto',Helvetica] font-normal text-gray-600 text-sm tracking-[0] leading-[21px]">
              <span className="text-[#757575]">Not registered?</span>
              <span className="font-medium text-[#757575]">&nbsp;</span>
              <a
                href="/register"
                className="p-0 h-auto font-medium text-[#212121] capitalize text-sm"
              >
                Create account
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
