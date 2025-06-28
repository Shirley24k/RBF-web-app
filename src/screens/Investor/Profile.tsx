import { PencilIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { IconButton, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";

export const InvestorProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      await axios.get(`${API_BASE_URL}/investor/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setProfile(response.data.data);
      })
    }
    fetchProfile();
  }, []);

  const handleEdit = () => {
    navigate("/edit-profile", { state: profile?.investment_preferences });
  };

  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="profile" />
      </div>

      {/* Main Content */}
      <div className="ml-[255px] p-10 w-full overflow-auto">
        {profile === null ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="h-12 w-12 text-dark-plum" />
          </div>
        ) : (
        <div className="space-y-10 max-w-[1200px] ml-[20px]">
          {/* Profile Header */}
          <div className="flex justify-center items-center flex-col space-y-4 pr-[100px]">
            <UserCircleIcon className="w-[120px] h-[120px] text-gray-400" />
            <div className="text-center">
              <Typography variant="h5" className="text-black">
                {profile?.name}
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
                  {profile?.type === "individual" ? (
                    <Typography className="text-lg font-medium text-black">
                      Country
                    </Typography>
                  ) : (
                    <Typography className="text-lg font-medium text-black">
                      Company Address
                    </Typography>
                  )
                  }
                  <Typography className="text-lg font-medium text-black">
                    Role
                  </Typography>
                </div>
                <div className="space-y-6">
                  <Typography className="text-lg font-medium text-light-purple">
                    {profile?.name}
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    {profile?.contact_no}
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    {user?.email}
                  </Typography>
                  {profile?.type === "individual" ? 
                  (
                  <Typography className="text-lg font-medium text-light-purple">
                    {profile?.country}
                  </Typography>
                  ) : 
                  (
                    <Typography className="text-lg font-medium text-light-purple">
                    {profile?.company_address}
                  </Typography>
                  )}
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
                    {profile?.investment_preferences.preferred_industry.join(", ")}
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    {profile?.investment_preferences.investment_amount_range}
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    {profile?.investment_preferences.preferred_funding_stage.join(", ")}
                  </Typography>
                  <Typography className="text-lg font-medium text-light-purple">
                    {profile?.investment_preferences.revenue_share_percentage}%
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
