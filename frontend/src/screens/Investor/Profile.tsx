import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
  Slider,
  Typography
} from "@material-tailwind/react";
import axios from "axios";
import { CountryCode, getCountries } from 'libphonenumber-js';
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import coinCirclingWallet from "../../assets/coin circling wallet.json";
import { ChangePasswordModal } from "../../components/ChangePasswordModal";
import AppButton from "../../components/ui/AppButton";
import { Sidenav } from "../../components/ui/sidenav";
import { isValidPhoneNumber } from "../../lib/utils";
import { fundingStageOptions, getFundingStageLabel } from "../../utils/fundingStage";
import { getIndustryLabel, industryOptions } from "../../utils/industryOptions";
import { investmentAmountOptions } from "../../utils/investmentAmountRange";

export const InvestorProfile = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Get list of countries from libphonenumber-js
  const countries = getCountries();

  // Function to get country name from country code
  const getCountryName = (countryCode: CountryCode): string => {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(countryCode) || countryCode;
  };

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Profile edit form states
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    contact_no: '',
    country: '',
    company_address: '',
    type: 'individual' as 'individual' | 'firm',
    investment_preferences: {
      preferred_industry: [] as string[],
      preferred_funding_stage: [] as string[],
      investment_amount_range: '',
      revenue_share_percentage: 0
    }
  });

  const [profileFormErrors, setProfileFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      await axios.get(`${API_BASE_URL}/investor/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setProfile(response.data.data);
        console.log(response.data.data);
      })
      .finally(() => {
        setLoading(false);
      });
    }
    fetchProfile();
  }, []);

  const validateProfileField = (name: 'name' | 'contact_no' | 'country' | 'company_address' | 'preferred_industry' | 'preferred_funding_stage' | 'investment_amount_range' | 'revenue_share_percentage', value: any): string | undefined => {
    switch (name) {
      case 'name':
        return !String(value).trim() ? 'Name is required' : undefined;
      case 'contact_no':
        if (!String(value).trim()) return 'Contact number is required';
        if (!isValidPhoneNumber(String(value))) return 'Please enter a valid phone number';
        return undefined;
      case 'country':
        return !String(value).trim() ? 'Country is required' : undefined;
      case 'company_address':
        return !String(value).trim() ? 'Company address is required' : undefined;
      case 'preferred_industry':
        return (value as string[]).length === 0 ? 'At least one preferred industry is required' : undefined;
      case 'preferred_funding_stage':
        return (value as string[]).length === 0 ? 'At least one preferred funding stage is required' : undefined;
      case 'investment_amount_range':
        return !value || value === '' ? 'Investment amount range is required' : undefined;
      case 'revenue_share_percentage':
        return Number(value) <= 0 ? 'Revenue share percentage must be greater than 0' : undefined;
      default:
        return undefined;
    }
  };

  const handleProfileChange = (name: keyof typeof profileFormData, value: any) => {
    setProfileFormData(prev => ({ ...prev, [name]: value }));
    const err = validateProfileField(name as any, value);
    setProfileFormErrors(prev => ({ ...prev, [name]: err || '' }));
    if (!err) setProfileFormErrors(prev => { const { [name]: _, ...rest } = prev as any; return rest; });
  };

  const handleInvestmentPreferenceChange = (field: string, value: any) => {
    setProfileFormData(prev => ({
      ...prev,
      investment_preferences: {
        ...prev.investment_preferences,
        [field]: value
      }
    }));
    const err = validateProfileField(field as any, value);
    setProfileFormErrors(prev => ({ ...prev, [field]: err || '' }));
    if (!err) setProfileFormErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
  };

  const handleIndustryChange = (industry: string, checked: boolean) => {
    const currentIndustries = profileFormData.investment_preferences.preferred_industry;
    const updatedIndustries = checked 
      ? [...currentIndustries, industry]
      : currentIndustries.filter(i => i !== industry);
    
    handleInvestmentPreferenceChange('preferred_industry', updatedIndustries);
  };

  const handleFundingStageChange = (stage: string, checked: boolean) => {
    const currentStages = profileFormData.investment_preferences.preferred_funding_stage;
    const updatedStages = checked 
      ? [...currentStages, stage]
      : currentStages.filter(s => s !== stage);
    
    handleInvestmentPreferenceChange('preferred_funding_stage', updatedStages);
  };

  const openEditModal = () => {
    if (profile) {
      setProfileFormData({
        name: profile.name,
        contact_no: profile.contact_no,
        country: profile.country || '',
        company_address: profile.company_address || '',
        type: profile.type,
        investment_preferences: {
          preferred_industry: profile.investment_preferences.preferred_industry,
          preferred_funding_stage: profile.investment_preferences.preferred_funding_stage,
          investment_amount_range: profile.investment_preferences.investment_amount_range,
          revenue_share_percentage: profile.investment_preferences.revenue_share_percentage
        }
      });
      setProfileFormErrors({});
    }
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    // Client-side validation
    const errors: Record<string, string> = {};
    (['name', 'contact_no', 'preferred_industry', 'preferred_funding_stage', 'investment_amount_range', 'revenue_share_percentage'] as const).forEach((k) => {
      let v;
      if (k === 'preferred_industry' || k === 'preferred_funding_stage' || k === 'revenue_share_percentage' || k === 'investment_amount_range') {
        v = (profileFormData.investment_preferences as any)[k];
      } else {
        v = String((profileFormData as any)[k] ?? '');
      }
      const e = validateProfileField(k as any, v);
      if (e) errors[k] = e;
    });
    
    if (profileFormData.type === 'individual' && !profileFormData.country.trim()) {
      errors.country = 'Country is required';
    }
    if (profileFormData.type === 'firm' && !profileFormData.company_address.trim()) {
      errors.company_address = 'Company address is required';
    }
    
    if (Object.keys(errors).length > 0) { 
      setProfileFormErrors(errors); return; 
    }

    setSubmitting(true);
    setProfileFormErrors({});

    try {
      const updateData = {
        name: profileFormData.name,
        contact_no: profileFormData.contact_no,
        country: profileFormData.country,
        company_address: profileFormData.company_address,
        type: profileFormData.type,
        investment_preferences: profileFormData.investment_preferences
      };
      
      const response = await axios.put(`${API_BASE_URL}/investor/profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setShowEditModal(false);
        // Refresh profile data
        const profileResponse = await axios.get(`${API_BASE_URL}/investor/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProfile(profileResponse.data.data);
        alert('Profile updated successfully!');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setProfileFormErrors(error.response.data.errors);
      } else {
        alert('Error updating profile: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Lottie 
          animationData={coinCirclingWallet} 
          loop={true} 
          autoplay={true}
          style={{ width: '15%', height: '15%' }}
        />
        <Typography variant="h4" className="text-xl max-md:text-base font-bold">Loading...</Typography>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0 z-20">
        <Sidenav active="profile" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden z-20">
        <Sidenav active="profile" />
      </div>

      {/* Main Content */}
      <main className="ml-24 max-sm:ml-16 transition-all duration-300 w-full">
        <div className="px-6 py-8 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
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
                <div className="flex items-center justify-between h-full">
                  <Typography variant="h5" className="text-black text-2xl max-md:text-xl max-sm:text-lg">
                    Personal Information
                  </Typography>
                  <div className="flex items-center gap-2">
                    <AppButton variant="text" onClick={() => setShowChangePasswordModal(true)} className="px-2 py-2">
                      <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                    </AppButton>
                    <AppButton variant="text" onClick={openEditModal} className="px-2 py-2">
                      <PencilIcon className="w-6 h-6 text-light-purple" />
                    </AppButton>
                  </div>
                </div>
                  <hr className="border-t-2 border-gray-300" />
                  <dl className="grid grid-cols-[400px_1fr] max-md:grid-cols-[300px_1fr] max-sm:grid-cols-1 gap-x-10 gap-y-4 max-sm:gap-x-0 max-sm:gap-y-2">
                    <Typography as="dt" className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">Name</Typography>
                    <Typography as="dd" className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">{profile?.name}</Typography>

                    <Typography as="dt" className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">Phone Number</Typography>
                    <Typography as="dd" className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">{profile?.contact_no}</Typography>

                    <Typography as="dt" className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">Email Address</Typography>
                    <Typography as="dd" className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">{user?.email}</Typography>

                    <Typography as="dt" className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">{profile?.type === "individual" ? "Country" : "Company Address"}</Typography>
                    <Typography as="dd" className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">{profile?.type === "individual" ? profile?.country : profile?.company_address}</Typography>

                    <Typography as="dt" className="text-lg max-md:text-base max-sm:text-sm font-medium text-black">Role</Typography>
                    <Typography as="dd" className="text-lg max-md:text-base max-sm:text-sm font-medium text-light-purple">Investor</Typography>
                  </dl>
                </div>
              </div>

              {/* Investment Preferences */}
              <div className="w-full">
                <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <Typography variant="h5" className="text-black text-2xl max-md:text-xl max-sm:text-lg">
                      Investment Preferences
                    </Typography>
                  </div>
                  <hr className="border-t-2 border-gray-300" />
                  <dl className="grid grid-cols-[400px_1fr] max-md:grid-cols-[300px_1fr] max-sm:grid-cols-1 gap-x-10 gap-y-4 max-sm:gap-x-0 max-sm:gap-y-2">
                    <Typography as="dt" className="text-base max-sm:text-sm font-medium text-black">Preferred Industry</Typography>
                    <Typography as="dd" className="text-base max-sm:text-sm font-medium text-light-purple">{profile?.investment_preferences.preferred_industry.map(getIndustryLabel).join(", ")}</Typography>

                    <Typography as="dt" className="text-base max-sm:text-sm font-medium text-black">Investment Amount Range</Typography>
                    <Typography as="dd" className="text-base max-sm:text-sm font-medium text-light-purple">{profile?.investment_preferences.investment_amount_range}</Typography>

                    <Typography as="dt" className="text-base max-sm:text-sm font-medium text-black">Funding Stage</Typography>
                    <Typography as="dd" className="text-base max-sm:text-sm font-medium text-light-purple capitalize">{profile?.investment_preferences.preferred_funding_stage.map(getFundingStageLabel).join(", ")}</Typography>

                    <Typography as="dt" className="text-base max-sm:text-sm font-medium text-black">Revenue share percentage</Typography>
                    <Typography as="dd" className="text-base max-sm:text-sm font-medium text-light-purple">{profile?.investment_preferences.revenue_share_percentage}%</Typography>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} handler={() => setShowEditModal(false)} size="xl" className="rounded-2xl">
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Edit Profile
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 max-h-[70vh] overflow-y-auto bg-beige">
          <div className="space-y-6">
            {/* Investor Type */}
            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <div>
                <Typography variant="h6" className="mb-3 font-bold text-dark-plum">
                  Investor Type
                </Typography>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Typography variant="paragraph" className="font-semibold text-gray-900 capitalize">
                    {profileFormData.type}
                  </Typography>
                  <Typography variant="small" color="gray" className="text-sm">
                    This field cannot be changed
                  </Typography>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <div className="flex flex-col">
                <Input
                  label="Name"
                  value={profileFormData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  error={!!profileFormErrors.name}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                />
                {profileFormErrors.name && (
                  <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                    {profileFormErrors.name}
                  </Typography>
                )}
              </div>

              <div className="flex flex-col">
                <Input
                  label="Contact Number"
                  value={profileFormData.contact_no}
                  onChange={(e) => handleProfileChange('contact_no', e.target.value)}
                  error={!!profileFormErrors.contact_no}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                />
                {profileFormErrors.contact_no && (
                  <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                    {profileFormErrors.contact_no}
                  </Typography>
                )}
              </div>

              {profileFormData.type === 'individual' ? (
                <div className="flex flex-col">
                  <Select
                    label="Select country"
                    className="bg-white text-blue-gray300"
                    value={profileFormData.country}
                    onChange={(value) => {
                      handleProfileChange('country', value || '');
                    }}
                    error={!!profileFormErrors.country}
                    size="lg"
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
                  {profileFormErrors.country && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {profileFormErrors.country}
                    </Typography>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  <Input
                    label="Company Address"
                    value={profileFormData.company_address}
                    onChange={(e) => handleProfileChange('company_address', e.target.value)}
                    error={!!profileFormErrors.company_address}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  />
                  {profileFormErrors.company_address && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {profileFormErrors.company_address}
                    </Typography>
                  )}
                </div>
              )}
            </div>



            {/* Investment Preferences */}
            <div className="border-t pt-6">
              <Typography variant="h6" className="mb-4 font-bold text-dark-plum">
                Investment Preferences
              </Typography>
              
              <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                <div>
                  <Typography variant="small" className="mb-2 font-medium text-gray-700">
                    Preferred Industries
                  </Typography>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                    {industryOptions.map((industry) => (
                      <label key={industry.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileFormData.investment_preferences.preferred_industry.includes(industry.value)}
                          onChange={(e) => handleIndustryChange(industry.value, e.target.checked)}
                          className="rounded border-gray-300 text-dark-plum focus:ring-light-purple h-5 w-5"
                        />
                        <Typography variant="small" className="text-sm">
                          {industry.label}
                        </Typography>
                      </label>
                    ))}
                  </div>
                  {profileFormErrors.preferred_industry && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {profileFormErrors.preferred_industry}
                    </Typography>
                  )}
                </div>

                <div>
                  <Typography variant="small" className="mb-2 font-medium text-gray-700">
                    Preferred Funding Stages
                  </Typography>
                  <div className="space-y-2 max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                    {fundingStageOptions.map((stage) => (
                      <label key={stage.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileFormData.investment_preferences.preferred_funding_stage.includes(stage.value)}
                          onChange={(e) => handleFundingStageChange(stage.value, e.target.checked)}
                          className="rounded border-gray-300 text-dark-plum focus:ring-light-purple h-5 w-5"
                        />
                        <Typography variant="small" className="text-sm capitalize">
                          {stage.label}
                        </Typography>
                      </label>
                    ))}
                  </div>
                  {profileFormErrors.preferred_funding_stage && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {profileFormErrors.preferred_funding_stage}
                    </Typography>
                  )}
                </div>

                <div className="flex flex-col">
                  <Select
                    label="Investment Amount Range"
                    value={profileFormData.investment_preferences.investment_amount_range}
                    onChange={(value) => {
                      handleInvestmentPreferenceChange('investment_amount_range', value || '');
                    }}
                    error={!!profileFormErrors.investment_amount_range}
                    className="bg-white text-blue-gray300"
                    size="lg"
                  >
                    {investmentAmountOptions.map((amount) => (
                      <Option key={amount} value={amount}>
                        {amount}
                      </Option>
                    ))}
                  </Select>
                  {profileFormErrors.investment_amount_range && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {profileFormErrors.investment_amount_range}
                    </Typography>
                  )}
                </div>

                <div className="flex flex-col"> 
                  <Typography variant="small" className="mb-2 font-medium text-gray-700">
                    Revenue Share Percentage
                  </Typography>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                    <Slider
                      value={profileFormData.investment_preferences.revenue_share_percentage}
                      onChange={(e) => {
                        handleInvestmentPreferenceChange('revenue_share_percentage', e.target.valueAsNumber);
                      }}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <Typography className="text-sm text-center w-[40px]">
                      {profileFormData.investment_preferences.revenue_share_percentage}%
                    </Typography>
                  </div>
                  {profileFormErrors.revenue_share_percentage && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {profileFormErrors.revenue_share_percentage}
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-4">
          <AppButton 
            variant="text" 
            size="md"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton 
            variant="primary"
            size="md"
            onClick={handleUpdateProfile} 
            disabled={submitting}
            loading={submitting}
          >
            Update Profile
          </AppButton>
        </DialogFooter>
      </Dialog>

      <ChangePasswordModal
        open={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        title="Change Password"
      />
    </div>
  );
};
