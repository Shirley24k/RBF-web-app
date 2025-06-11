import { PencilIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { IconButton, Typography } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";

export const InvestorProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultPreferences = {
    preferredIndustry: ["SaaS", "FinTech", "EdTech"],
    investmentAmount: "RM 20,000 - 50,000",
    fundingStage: ["Seed", "Series A"],
    revenueShare: 5,
  };

  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    if (location.state) {
      setPreferences((prev) => ({
        ...prev,
        ...location.state,
      }));
    }
  }, [location.state]);

  const handleEdit = () => {
    navigate("/edit-profile", { state: preferences });
  };

  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="profile" />
      </div>

      {/* Main Content */}
      <div className="ml-[255px] p-10 w-full overflow-auto">
        <div className="space-y-10 max-w-[1200px] ml-[20px]">
          {/* Profile Header */}
          <div className="flex justify-center items-center flex-col space-y-4 pr-[100px]">
            <UserCircleIcon className="w-[120px] h-[120px] text-gray-400" />
            <div className="text-center">
              <Typography variant="h5" className="text-black">
                John Tan
              </Typography>
              <Typography className="text-light-purple text-base font-medium">
                Investor
              </Typography>
            </div>
          </div>

          {/* Personal Information */}
          <div className="w-full">
            <div className="space-y-6">
              <Typography variant="h5" className="text-black">
                Personal Information
              </Typography>
              <hr className="border-t-2 border-gray-300" />
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Typography className="text-lg font-medium text-black">
                    Name
                  </Typography>
                  <Typography className="text-lg font-medium text-black">
                    Phone Number
                  </Typography>
                  <Typography className="text-lg font-medium text-black">
                    Email Address
                  </Typography>
                  <Typography className="text-lg font-medium text-black">
                    Country
                  </Typography>
                  <Typography className="text-lg font-medium text-black">
                    Role
                  </Typography>
                </div>
                <div className="space-y-6">
                  <Typography className="text-lg font-medium text-light-purple">
                    John Tan
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    +6012-345 6789
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    john@gmail.com
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    Malaysia
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    Investor
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="w-full">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Typography variant="h5" className="text-black">
                  Investment Preferences
                </Typography>
                <IconButton variant="text" onClick={handleEdit}>
                  <PencilIcon className="w-6 h-6 text-light-purple" />
                </IconButton>
              </div>
              <hr className="border-t-2 border-gray-300" />
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Typography className="text-lg font-medium text-black">
                    Preferred Industry
                  </Typography>
                  <Typography className="text-lg font-medium text-black">
                    Investment Amount Range
                  </Typography>
                  <Typography className="text-lg font-medium text-black">
                    Funding Stage
                  </Typography>
                  <Typography className="text-lg font-medium text-black">
                    Revenue share percentage
                  </Typography>
                </div>
                <div className="space-y-6">
                  <Typography className="text-lg font-medium text-light-purple">
                    {preferences.preferredIndustry.join(", ")}
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    {preferences.investmentAmount}
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    {preferences.fundingStage.join(", ")}
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    {preferences.revenueShare}%
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
