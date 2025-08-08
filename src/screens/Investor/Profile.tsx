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
    <div className="bg-white flex flex-row justify-center w-full pb-10">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="profile" />
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="profile" />
      </div>

      {/* Main Content */}
      <div className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1">
        <div className="flex-1 p-6 max-md:p-4 max-sm:p-3 overflow-y-auto">
          {profile === null ? (
            <div className="flex justify-center items-center min-h-screen">
              <Spinner className="h-12 w-12 text-dark-plum" />
            </div>
          ) : (
          <div className="space-y-8 max-md:space-y-6 max-sm:space-y-4 max-w-3xl mx-auto">
            {/* Profile Header */}
            <div className="flex justify-center items-center flex-col space-y-4 max-md:space-y-3 max-sm:space-y-2">
              <UserCircleIcon className="w-24 h-24 max-md:w-20 max-md:h-20 max-sm:w-16 max-sm:h-16 text-gray-400" />
              <div className="text-center">
                <Typography variant="h5" className="text-black text-2xl max-md:text-xl max-sm:text-lg">
                  {profile?.name}
                </Typography>
                <Typography className="text-light-purple text-lg max-md:text-base max-sm:text-sm font-medium">
                  Investor
                </Typography>
              </div>
            </div>

            {/* Personal Information */}
            <div className="w-full">
              <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
                <Typography variant="h5" className="text-black text-2xl max-md:text-xl max-sm:text-lg">
                  Personal Information
                </Typography>
                <hr className="border-t-2 border-gray-300" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-3 max-sm:gap-2">
                  {/* Desktop/Tablet: Two-column layout */}
                  <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                      Name
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                      Phone Number
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                      Email Address
                    </Typography>
                    {profile?.type === "individual" ? (
                      <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                        Country
                      </Typography>
                    ) : (
                      <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                        Company Address
                      </Typography>
                    )}
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                      Role
                    </Typography>
                  </div>
                  <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {profile?.name}
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {profile?.contact_no}
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {user?.email}
                    </Typography>
                    {profile?.type === "individual" ? 
                    (
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {profile?.country}
                    </Typography>
                    ) : 
                    (
                      <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {profile?.company_address}
                    </Typography>
                    )}
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      Investor
                    </Typography>
                  </div>

                  {/* Mobile: Label-value pairs */}
                  <div className="md:hidden flex flex-col gap-y-4 max-sm:gap-y-3">
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        Name
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        {profile?.name}
                      </Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        Phone Number
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        {profile?.contact_no}
                      </Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        Email Address
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        {user?.email}
                      </Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        {profile?.type === "individual" ? "Country" : "Company Address"}
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        {profile?.type === "individual" ? profile?.country : profile?.company_address}
                      </Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        Role
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        Investor
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Preferences */}
            <div className="w-full">
              <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Typography variant="h5" className="text-black text-2xl max-md:text-xl max-sm:text-lg">
                    Investment Preferences
                  </Typography>
                  <IconButton variant="text" onClick={handleEdit} className="w-8 h-8 max-md:w-6 max-md:h-6 max-sm:w-5 max-sm:h-5">
                    <PencilIcon className="w-6 h-6 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3 text-light-purple" />
                  </IconButton>
                </div>
                <hr className="border-t-2 border-gray-300" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-3 max-sm:gap-2">
                  {/* Desktop/Tablet: Two-column layout */}
                  <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                      Preferred Industry
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                      Investment Amount Range
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                      Funding Stage
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">
                      Revenue share percentage
                    </Typography>
                  </div>
                  <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {profile?.investment_preferences.preferred_industry.join(", ")}
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {profile?.investment_preferences.investment_amount_range}
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {profile?.investment_preferences.preferred_funding_stage.join(", ")}
                    </Typography>
                    <Typography className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">
                      {profile?.investment_preferences.revenue_share_percentage}%
                    </Typography>
                  </div>

                  {/* Mobile: Label-value pairs */}
                  <div className="md:hidden flex flex-col gap-y-4 max-sm:gap-y-3">
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        Preferred Industry
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        {profile?.investment_preferences.preferred_industry.join(", ")}
                      </Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        Investment Amount Range
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        {profile?.investment_preferences.investment_amount_range}
                      </Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        Funding Stage
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        {profile?.investment_preferences.preferred_funding_stage.join(", ")}
                      </Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography className="text-base max-sm:text-sm font-medium text-black">
                        Revenue share percentage
                      </Typography>
                      <Typography className="text-base max-sm:text-sm font-medium text-light-purple">
                        {profile?.investment_preferences.revenue_share_percentage}%
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
