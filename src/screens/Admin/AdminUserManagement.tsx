import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  EyeIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
  Spinner,
  Textarea,
  Typography
} from "@material-tailwind/react";
import axios from "axios";
import clsx from "clsx";
import { CountryCode, getCountries } from 'libphonenumber-js';
import { useEffect, useState } from "react";
import { Sidenav } from "../../components/sidenav";
import { isValidPhoneNumber } from "../../lib/utils";
import { getIndustryLabel, industryOptions } from "../../utils/industryOptions";

interface User {
  id: number;
  email: string;
  role: string;
  email_verified_at: string | null;
  created_at: string;
  profile: {
    type: 'startup' | 'investor' | 'staff';
    name: string;
    contact_no: string;
    company_name?: string;
    company_sector?: string;
    company_address?: string;
    country?: string;
    investment_preferences?: any;
    position?: string;
    permissions?: string[];
    status?: string;
    startup_id?: number;
    startup_company_name?: string;
    startup_user_id?: number | null;
  } | null;
}

interface FormErrors {
  [key: string]: string;
}

interface InvestmentPreferences {
  preferred_industry: string[];
  preferred_funding_stage: string[];
  investment_amount_range: string;
  revenue_share_percentage: number;
}

export const AdminUserManagement = (): JSX.Element => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  //replace underscore with space 
  const getFundingStageLabel = (value: string): string => {
    return value.replace(/_/g, ' ')
  };

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
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Change password states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Account creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountType, setAccountType] = useState<'startup' | 'investor'>('startup');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // touched states for field-level validation UX parity with public pages
  const [startupTouched, setStartupTouched] = useState({
    name: false,
    email: false,
    password: false,
    contact_no: false,
    company_name: false,
    company_sector: false,
    company_address: false,
  });
  const [investorTouched, setInvestorTouched] = useState({
    name: false,
    email: false,
    password: false,
    contact_no: false,
    country: false,
    company_address: false,
    preferred_industry: false,
    preferred_funding_stage: false,
    investment_amount_range: false,
    revenue_share_percentage: false,
  });
  
  // Startup form data
  const [startupForm, setStartupForm] = useState({
    name: '',
    email: '',
    password: '',
    contact_no: '',
    company_name: '',
    company_sector: '',
    company_address: ''
  });
  
  // Investor form data
  const [investorForm, setInvestorForm] = useState({
    type: 'individual' as 'individual' | 'firm',
    name: '',
    email: '',
    password: '',
    contact_no: '',
    country: '',
    company_address: '',
    investment_preferences: {
      preferred_industry: [] as string[],
      preferred_funding_stage: [] as string[],
      investment_amount_range: '',
      revenue_share_percentage: 0
    } as InvestmentPreferences
  });

  const investmentAmountOptions = [
    "Less than RM 100,000",
    "RM 100,000 - RM 500,000",
    "RM 500,000 - RM 1,000,000",
    "RM 1,000,000 - RM 2,000,000",
    "RM 2,000,000 - RM 5,000,000",
    "More than RM 5,000,000"
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        alert('Only admins can access user management.');
        window.history.back();
      }
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // Change password functions
  const openChangePasswordModal = (user: User) => {
    setSelectedUser(user);
    setPasswordForm({
      new_password: '',
      confirm_password: ''
    });
    setPasswordErrors({});
    setShowChangePasswordModal(true);
  };

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setSelectedUser(null);
    setPasswordForm({
      new_password: '',
      confirm_password: ''
    });
    setPasswordErrors({});
  };

  const validatePasswordForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!passwordForm.new_password) errors.new_password = 'New password is required';
    else if (passwordForm.new_password.length < 8) errors.new_password = 'Password must be at least 8 characters';
    
    if (!passwordForm.confirm_password) errors.confirm_password = 'Confirm password is required';
    else if (passwordForm.new_password !== passwordForm.confirm_password) errors.confirm_password = 'Passwords do not match';
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordField = (name: 'new_password' | 'confirm_password', value: string): string | undefined => {
    switch (name) {
      case 'new_password':
        if (!value) return 'New password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      case 'confirm_password':
        if (!value) return 'Confirm password is required';
        if (passwordForm.new_password !== value) return 'Passwords do not match';
        return undefined;
      default:
        return undefined;
    }
  };

  const handlePasswordChange = (name: 'new_password' | 'confirm_password', value: string) => {
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    const err = validatePasswordField(name, value);
    setPasswordErrors(prev => ({ ...prev, [name]: err || '' }));
    if (!err) setPasswordErrors(prev => { const { [name]: _, ...rest } = prev; return rest; });
  };

  const handlePasswordBlur = (name: 'new_password' | 'confirm_password') => {
    const value = passwordForm[name];
    const err = validatePasswordField(name, value);
    setPasswordErrors(prev => ({ ...prev, [name]: err || '' }));
  };

  const handleChangePassword = async () => {
    if (changingPassword || !selectedUser) return;

    if (!validatePasswordForm()) return;

    setChangingPassword(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/change-user-password`, {
        user_id: selectedUser.id,
        new_password: passwordForm.new_password
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        alert('Password changed successfully!');
        closeChangePasswordModal();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setPasswordErrors(error.response.data.errors);
      } else {
        alert('Failed to change password: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="h-5 w-5 text-red-500" />;
      case 'startup':
        return <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />;
      case 'investor':
        return <UserGroupIcon className="h-5 w-5 text-green-500" />;
      case 'staff':
        return <UserIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Account creation functions
  const resetForms = () => {
    setStartupForm({
      name: '',
      email: '',
      password: '',
      contact_no: '',
      company_name: '',
      company_sector: '',
      company_address: ''
    });
    
    setInvestorForm({
      type: 'individual',
      name: '',
      email: '',
      password: '',
      contact_no: '',
      country: '',
      company_address: '',
      investment_preferences: {
        preferred_industry: [],
        preferred_funding_stage: [],
        investment_amount_range: '',
        revenue_share_percentage: 0
      }
    });
    
    setFormErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  };

  const openCreateModal = () => {
    resetForms();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForms();
  };

  const validateStartupForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!startupForm.name.trim()) errors.name = 'Full name is required';
    if (!startupForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(startupForm.email)) errors.email = 'Email is invalid';
    if (!startupForm.password) errors.password = 'Password is required';
    else if (startupForm.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!startupForm.contact_no.trim()) errors.contact_no = 'Contact number is required';
    if (!startupForm.company_name.trim()) errors.company_name = 'Company name is required';
    if (!startupForm.company_sector) errors.company_sector = 'Company sector is required';
    if (!startupForm.company_address.trim()) errors.company_address = 'Company address is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStartupField = (name: keyof typeof startupForm, value: string): string | undefined => {
    switch (name) {
      case 'name':
        return !value.trim() ? 'Full name is required' : undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return undefined;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      case 'contact_no':
        if (!value.trim()) return 'Contact number is required';
        if (!isValidPhoneNumber(value)) return 'Please enter a valid phone number';
        return undefined;
      case 'company_name':
        return !value.trim() ? 'Company name is required' : undefined;
      case 'company_sector':
        return !value ? 'Company sector is required' : undefined;
      case 'company_address':
        return !value.trim() ? 'Company address is required' : undefined;
      default:
        return undefined;
    }
  };

  const handleStartupChange = (name: keyof typeof startupForm, value: string) => {
    setStartupForm(prev => ({ ...prev, [name]: value }));
    const err = validateStartupField(name, value || '');
    setFormErrors(prev => ({ ...prev, [name]: err || '' }));
    // clear error when fixed
    if (!err) setFormErrors(prev => { const { [name]: _, ...rest } = prev; return rest; });
  };

  const handleStartupBlur = (name: keyof typeof startupForm) => {
    setStartupTouched(prev => ({ ...prev, [name]: true }));
    const value = String(startupForm[name] ?? '');
    const err = validateStartupField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: err || '' }));
  };

  const validateInvestorForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!investorForm.name.trim()) errors.name = 'Name is required';
    if (!investorForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(investorForm.email)) errors.email = 'Email is invalid';
    if (!investorForm.password) errors.password = 'Password is required';
    else if (investorForm.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!investorForm.contact_no.trim()) errors.contact_no = 'Contact number is required';
    if (investorForm.type === 'individual' && !investorForm.country.trim()) errors.country = 'Country is required';
    if (investorForm.type === 'firm' && !investorForm.company_address.trim()) errors.company_address = 'Company address is required';
    if (investorForm.investment_preferences.preferred_industry.length === 0) errors.preferred_industry = 'At least one preferred industry is required';
    if (investorForm.investment_preferences.preferred_funding_stage.length === 0) errors.preferred_funding_stage = 'At least one preferred funding stage is required';
    if (!investorForm.investment_preferences.investment_amount_range) errors.investment_amount_range = 'Investment amount range is required';
    if (investorForm.investment_preferences.revenue_share_percentage <= 0) errors.revenue_share_percentage = 'Revenue share percentage must be greater than 0';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateInvestorField = (name: keyof typeof investorForm | keyof InvestmentPreferences | 'preferred_industry' | 'preferred_funding_stage' | 'investment_amount_range' | 'revenue_share_percentage', value: any): string | undefined => {
    switch (name) {
      case 'name':
        return !String(value).trim() ? 'Name is required' : undefined;
      case 'email':
        if (!String(value).trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(String(value))) return 'Email is invalid';
        return undefined;
      case 'password':
        if (!String(value)) return 'Password is required';
        if (String(value).length < 8) return 'Password must be at least 8 characters';
        return undefined;
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
        return !String(value) ? 'Investment amount range is required' : undefined;
      case 'revenue_share_percentage':
        return Number(value) <= 0 ? 'Revenue share percentage must be greater than 0' : undefined;
      default:
        return undefined;
    }
  };

  const handleInvestorChange = (name: keyof typeof investorForm, value: any) => {
    setInvestorForm(prev => ({ ...prev, [name]: value }));
    const err = validateInvestorField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: err || '' }));
    if (!err) setFormErrors(prev => { const { [name]: _, ...rest } = prev as any; return rest; });
  };

  const handleInvestorPrefChange = (name: 'investment_amount_range' | 'revenue_share_percentage' | 'preferred_industry' | 'preferred_funding_stage', value: any) => {
    // Update nested investment_preferences or arrays
    if (name === 'investment_amount_range' || name === 'revenue_share_percentage') {
      handleInvestmentPreferenceChange(name as any, value);
    }
    const err = validateInvestorField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: err || '' }));
    if (!err) setFormErrors(prev => { const { [name]: _, ...rest } = prev; return rest; });
    setInvestorTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleCreateAccount = async () => {
    if (submitting) return;

    const isValid = accountType === 'startup' ? validateStartupForm() : validateInvestorForm();
    if (!isValid) {
      // Mark all fields as touched so errors display like public pages
      if (accountType === 'startup') {
        setStartupTouched({
          name: true,
          email: true,
          password: true,
          contact_no: true,
          company_name: true,
          company_sector: true,
          company_address: true,
        });
      } else {
        setInvestorTouched({
          name: true,
          email: true,
          password: true,
          contact_no: true,
          country: true,
          company_address: true,
          preferred_industry: true,
          preferred_funding_stage: true,
          investment_amount_range: true,
          revenue_share_percentage: true,
        });
      }
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const endpoint = accountType === 'startup' 
        ? '/admin/create-startup-account' 
        : '/admin/create-investor-account';
      
      const formData = accountType === 'startup' ? startupForm : investorForm;
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setSuccessMessage(`${accountType.charAt(0).toUpperCase() + accountType.slice(1)} account created successfully!`);
        setTimeout(() => {
          closeCreateModal();
          fetchUsers();
        }, 2000);
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const backendErrors = error.response?.data?.errors;
        if (backendErrors) {
          // Align error keys with Register pages mapping
          const mapped: Record<string, string> = {};
          Object.keys(backendErrors).forEach((key) => {
            const firstMsg = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
            if (accountType === 'investor') {
              // Map nested investor preference keys like in InvestorRegisterPage
              const frontendKey =
                key === 'contact_no' ? 'contact_no' :
                key === 'investment_preferences.preferred_industry' ? 'preferred_industry' :
                key === 'investment_preferences.preferred_funding_stage' ? 'preferred_funding_stage' :
                key === 'investment_preferences.investment_amount_range' ? 'investment_amount_range' :
                key === 'investment_preferences.revenue_share_percentage' ? 'revenue_share_percentage' :
                key;
              mapped[frontendKey] = firstMsg;
            } else {
              mapped[key] = firstMsg;
            }
          });
          setFormErrors(mapped);
        } else if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage('Invalid form data. Please check your inputs.');
        }
      } else if (error.response?.status === 409) {
        setFormErrors({ email: 'Email already exists. Please use a different email.' });
      } else {
        setErrorMessage(error.response?.data?.error || 'Failed to create account. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvestmentPreferenceChange = (field: keyof InvestmentPreferences, value: any) => {
    setInvestorForm(prev => ({
      ...prev,
      investment_preferences: {
        ...prev.investment_preferences,
        [field]: value
      }
    }));
  };

  const handleIndustryChange = (industry: string, checked: boolean) => {
    const currentIndustries = investorForm.investment_preferences.preferred_industry;
    const updatedIndustries = checked 
      ? [...currentIndustries, industry]
      : currentIndustries.filter(i => i !== industry);
    
    handleInvestmentPreferenceChange('preferred_industry', updatedIndustries);
    // field-level validation & touched
    setInvestorTouched(prev => ({ ...prev, preferred_industry: true }));
    const err = validateInvestorField('preferred_industry', updatedIndustries);
    setFormErrors(prev => ({ ...prev, preferred_industry: err || '' }));
    if (!err) setFormErrors(prev => { const { preferred_industry, ...rest } = prev; return rest; });
  };

  const handleFundingStageChange = (stage: string, checked: boolean) => {
    const currentStages = investorForm.investment_preferences.preferred_funding_stage;
    const updatedStages = checked 
      ? [...currentStages, stage]
      : currentStages.filter(s => s !== stage);
    
    handleInvestmentPreferenceChange('preferred_funding_stage', updatedStages);
    // field-level validation & touched
    setInvestorTouched(prev => ({ ...prev, preferred_funding_stage: true }));
    const err = validateInvestorField('preferred_funding_stage', updatedStages);
    setFormErrors(prev => ({ ...prev, preferred_funding_stage: err || '' }));
    if (!err) setFormErrors(prev => { const { preferred_funding_stage, ...rest } = prev; return rest; });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner className="h-12 w-12 text-dark-plum mx-auto mb-4" />
          <Typography variant="h6" color="gray" className="font-medium">
            Loading User Management...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0 z-20">
        <Sidenav active="user-management" />
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden z-20">
        <Sidenav active="user-management" />
      </div>

      {/* Main Content */}
      <main className="ml-20 transition-all duration-300 min-h-screen flex-1 w-[calc(100%-16rem)] max-sm:w-[calc(100%-5rem)]">
        <div className="px-6 py-8 lg:px-8 xl:px-12 max-md:px-4 max-sm:px-3 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="w-full">
              <div className="mb-16 max-lg:mb-12 max-sm:mb-8">
                <div className="flex flex-row lg:items-center lg:justify-between gap-4 max-sm:gap-2">
                  <div className="flex-1">
                    <Typography variant="h4" className="text-4xl max-lg:text-3xl max-sm:text-2xl font-bold text-gray-900 mb-6 max-lg:mb-4 max-sm:mb-3">
                      User Management
                    </Typography>
                    <Typography variant="paragraph" className="text-xl max-lg:text-base max-sm:text-sm text-gray-600 max-w-2xl">
                      Manage all platform users and create new accounts
                    </Typography>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      className="flex items-center gap-3 bg-dark-plum hover:bg-light-purple text-white px-6 py-3 max-md:px-5 max-md:py-2.5 max-sm:px-3 max-sm:py-2 rounded-lg font-semibold text-base max-md:text-sm max-sm:text-xs capitalize w-full lg:w-auto"
                      onClick={openCreateModal}
                    >
                      <PlusIcon className="hidden sm:block h-5 w-5" />
                      <span className="max-sm:hidden">Create New Account</span>
                      <span className="sm:hidden">Create Account</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          {/* Content */}
          {/* Grouped Users Table */}
          <div className="space-y-8">
            {/* Startups Group */}
            <Card className="mb-8 max-md:mb-6 max-sm:mb-4 shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader
                variant="gradient"
                className="bg-gradient-to-r from-dark-plum to-light-purple mx-0 my-0 grid py-3 max-md:py-2 place-items-center"
              >
                <Typography variant="h4" color="white" className="flex items-center gap-3 font-bold text-2xl max-md:text-xl max-sm:text-lg">
                  <BuildingOfficeIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4" />
                  Startups
                </Typography>
              </CardHeader>
              <CardBody className="px-0 pt-0 pb-2">
                {users.filter(u => u.role === 'startup' || u.role === 'staff').length === 0 ? (
                  <div className="text-center py-12 max-md:py-8 max-sm:py-6">
                    <Typography variant="h5" color="gray" className="mb-3 max-md:mb-2 max-sm:mb-1 font-semibold text-2xl max-md:text-xl max-sm:text-lg">
                      No Startups Found
                    </Typography>
                  </div>
                ) : (
                  <div className="w-full">
                    <table className="w-full table-auto">
                      <thead className="border-b border-blue-gray-50">
                        <tr className="bg-gray-50">
                          <th className="p-4 max-sm:p-3 text-left">
                            <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                              Startup / Staff
                            </Typography>
                          </th>
                          <th className="hidden sm:table-cell p-4 max-sm:p-3 text-left">
                            <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                              Role
                            </Typography>
                          </th>
                          <th className="p-4 max-sm:p-3 text-left">
                            <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                              Actions
                            </Typography>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(u => u.role === 'startup')
                          .map((startupUser) => {
                            const staffForStartup = users.filter(u => u.role === 'staff' && (u.profile?.startup_user_id === startupUser.id));
                            return (
                              <>
                                <tr key={`startup-${startupUser.id}`} className="hover:bg-gray-50 transition-colors border-b border-blue-gray-50">
                                  <td className="p-4 max-sm:p-3">
                                    <div className="flex items-center gap-3 max-sm:gap-2">
                                      <div className="w-10 h-10 max-sm:w-8 max-sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        {getRoleIcon('startup')}
                                      </div>
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <Typography variant="small" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs truncate">
                                          {startupUser.profile?.name || 'N/A'}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="text-xs max-sm:text-[10px]">
                                          ID: {startupUser.id}
                                        </Typography>
                                        {/* Show email and role on mobile under the name */}
                                        <div className="sm:hidden mt-1 space-y-1">
                                          <div className="text-xs font-medium text-gray-600">STARTUP</div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="hidden sm:table-cell p-4 max-sm:p-3">
                                    <div className="flex items-center">
                                      <span className="text-sm max-md:text-xs max-sm:text-[10px] font-medium">STARTUP</span>
                                    </div>
                                  </td>
                                  <td className="p-4 max-sm:p-3 flex justify-start">
                                    <div className="flex items-center gap-2 max-sm:gap-1 justify-end max-sm:flex-col">
                                      <Button size="sm" variant="text" className="text-dark-plum hover:bg-light-purple/10 p-2 max-sm:p-1" onClick={() => openUserModal(startupUser)} title="View Details">
                                        <EyeIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                      </Button>
                                      <Button size="sm" variant="text" className="text-green-600 hover:bg-green-50 p-2 max-sm:p-1" onClick={() => openChangePasswordModal(startupUser)} title="Change Password">
                                        <ShieldCheckIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                                {staffForStartup.length > 0 && staffForStartup.map((staffUser) => (
                                  <tr key={`staff-${staffUser.id}`} className="hover:bg-gray-50 transition-colors border-b border-blue-gray-50">
                                    <td className="p-3 max-sm:p-2 pl-10 max-sm:pl-6">
                                      <div className="flex items-center gap-2 max-sm:gap-1">
                                        <div className="w-6 h-6 max-sm:w-5 max-sm:h-5 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                          {getRoleIcon('staff')}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                          <Typography variant="small" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs truncate">
                                            {staffUser.profile?.name || 'N/A'}
                                          </Typography>
                                          <Typography variant="small" color="gray" className="text-xs max-sm:text-[10px]">
                                            ID: {staffUser.id}
                                          </Typography>
                                          {/* Show email and role on mobile under the name */}
                                          <div className="sm:hidden mt-1 space-y-1">
                                            <div className="text-xs font-medium text-gray-600">STAFF</div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="hidden sm:table-cell p-3 max-sm:p-2 border-b border-blue-gray-50">
                                      <div className="flex items-center">
                                        <span className="text-sm max-md:text-xs max-sm:text-[10px] font-medium">STAFF</span>
                                      </div>
                                    </td>
                                    <td className="p-3 max-sm:p-2 border-blue-gray-50 flex justify-start">
                                      <div className="flex items-center gap-2 max-sm:gap-1 justify-end max-sm:flex-col">
                                        <Button size="sm" variant="text" className="text-dark-plum hover:bg-light-purple/10 p-2 max-sm:p-1" onClick={() => openUserModal(staffUser)} title="View Details">
                                          <EyeIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                        </Button>
                                        <Button size="sm" variant="text" className="text-green-600 hover:bg-green-50 p-2 max-sm:p-1" onClick={() => openChangePasswordModal(staffUser)} title="Change Password">
                                          <ShieldCheckIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </>
                            );
                          })}

                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Investors Group */}
            <Card className="mb-8 max-md:mb-6 max-sm:mb-4 shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader
                variant="gradient"
                className="bg-gradient-to-r from-dark-plum to-light-purple mx-0 my-0 grid py-3 max-md:py-2 place-items-center"
              >
                <Typography variant="h4" color="white" className="flex items-center gap-3 font-bold text-2xl max-md:text-xl max-sm:text-lg">
                  <UserGroupIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4" />
                  Investors
                </Typography>
              </CardHeader>
              <CardBody className="px-0 pt-0 pb-2">
                {users.filter(u => u.role === 'investor').length === 0 ? (
                  <div className="text-center py-12 max-md:py-8 max-sm:py-6">
                    <Typography variant="h5" color="gray" className="mb-3 max-md:mb-2 max-sm:mb-1 font-semibold text-2xl max-md:text-xl max-sm:text-lg">
                      No Investors Found
                    </Typography>
                  </div>
                ) : (
                  <div className="w-full">
                    <table className="w-full table-auto">
                      <thead className="border-b border-blue-gray-50">
                        <tr className="bg-gray-50">
                          <th className="p-4 max-sm:p-3 text-left">
                            <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                              Investor
                            </Typography>
                          </th>
                          <th className="hidden sm:table-cell p-4 max-sm:p-3 text-left">
                            <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                              Role
                            </Typography>
                          </th>
                          <th className="p-4 max-sm:p-3 text-left">
                            <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                              Actions
                            </Typography>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.role === 'investor').map((investor, idx) => {
                          return (
                            <tr key={investor.id} className="hover:bg-gray-50 transition-colors border-b border-blue-gray-50">
                              <td className="p-4 max-sm:p-3">
                                <div className="flex items-center gap-3 max-sm:gap-2">
                                  <div className="w-10 h-10 max-sm:w-8 max-sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    {getRoleIcon('investor')}
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <Typography variant="small" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs truncate">{investor.profile?.name || 'N/A'}</Typography>
                                    <Typography variant="small" color="gray" className="text-xs max-sm:text-[10px]">ID: {investor.id}</Typography>
                                    {/* Show email and role on mobile under the name */}
                                    <div className="sm:hidden mt-1 space-y-1">
                                      <div className="text-xs font-medium text-gray-600">INVESTOR</div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell p-4 max-sm:p-3">
                                <div className="flex items-center">
                                  <span className="text-sm max-md:text-xs max-sm:text-[10px] font-medium">INVESTOR</span>
                                </div>
                              </td>
                              <td className="p-4 max-sm:p-3 flex justify-start">
                                <div className="flex items-center gap-2 max-sm:gap-1 justify-end max-sm:flex-col">
                                  <Button size="sm" variant="text" className="text-dark-plum hover:bg-light-purple/10 p-2 max-sm:p-1" onClick={() => openUserModal(investor)} title="View Details">
                                    <EyeIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                  </Button>
                                  <Button size="sm" variant="text" className="text-green-600 hover:bg-green-50 p-2 max-sm:p-1" onClick={() => openChangePasswordModal(investor)} title="Change Password">
                                    <ShieldCheckIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
          </div>
        </div>
      </main>

      {/* User Details Modal */}
      <Dialog open={showUserModal} handler={closeUserModal} size="lg" className="rounded-2xl max-w-[95vw] max-h-[95vh]" placeholder={undefined}>
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            User Details
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 max-md:p-6 max-sm:p-4 max-h-[70vh] overflow-y-auto bg-beige">
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="h6" className="mb-3 font-bold text-dark-plum underline">
                    Account Information
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                        User ID
                      </Typography>
                      <Typography variant="paragraph" className="font-normal text-gray-900">
                        {selectedUser.id}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                        Email
                      </Typography>
                      <Typography variant="paragraph" className="font-normal text-gray-900">
                        {selectedUser.email}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                        Role
                      </Typography>
                      <Typography variant="paragraph" className="font-normal text-gray-900">
                        {selectedUser.role.toUpperCase()}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                        Status
                      </Typography>
                      <Typography variant="paragraph" className="font-normal text-gray-900">
                        {selectedUser.email_verified_at ? 'VERIFIED' : 'UNVERIFIED'}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                        Created At
                      </Typography>
                      <Typography variant="paragraph" className="font-normal text-gray-900">
                        {new Date(selectedUser.created_at).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </div>

                {selectedUser.profile && (
                  <div>
                    <Typography variant="h6" className="mb-3 font-bold text-dark-plum underline">
                      Profile Information
                    </Typography>
                    <div className="space-y-3">
                      <div>
                        <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                          Name
                        </Typography>
                        <Typography variant="paragraph" className="font-normal text-gray-900">
                          {selectedUser.profile.name}
                        </Typography>
                      </div>
                      {selectedUser.role === 'staff' ? (
                        <>
                          <div>
                            <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                              Position
                            </Typography>
                            <Typography variant="paragraph" className="font-normal text-gray-900">
                              {selectedUser.profile.position || 'N/A'}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                            Permissions
                            </Typography>
                            <div className="mt-2 flex flex-wrap gap-2">
                            {selectedUser.profile.permissions?.length === 0 ? (
                                <Typography variant="small" color="gray">No permissions</Typography>
                            ) : (
                                selectedUser.profile.permissions?.map((permission) => (
                                <Chip
                                    key={permission}
                                    variant="ghost"
                                    size="sm"
                                    value={permission.toUpperCase().replace(/_/g, ' ')}
                                    className="text-xs bg-light-purple/10 text-dark-plum font-medium"
                                />
                                ))
                            )}
                            </div>
                        </div>
                        </>
                      ) : (
                        <div>
                          <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                            Contact Number
                          </Typography>
                          <Typography variant="paragraph" className="font-normal text-gray-900">
                            {selectedUser.profile.contact_no}
                          </Typography>
                        </div>
                      )}
                      {selectedUser.profile.type === 'startup' && (
                        <>
                          <div>
                            <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                              Company Name
                            </Typography>
                            <Typography variant="paragraph" className="font-normal text-gray-900">
                              {selectedUser.profile.company_name}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                              Company Sector
                            </Typography>
                            <Typography variant="paragraph" className="font-normal text-gray-900">
                              {selectedUser.profile.company_sector}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                              Company Address
                            </Typography>
                            <Typography variant="paragraph" className="font-normal text-gray-900">
                              {selectedUser.profile.company_address}
                            </Typography>
                          </div>
                        </>
                      )}
                      {selectedUser.profile.type === 'investor' && (
                        <>
                          {selectedUser.profile.country && (
                            <div>
                              <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                                Country
                              </Typography>
                              <Typography variant="paragraph" className="font-normal text-gray-900">
                                {selectedUser.profile.country}
                              </Typography>
                            </div>
                          )}
                          {selectedUser.profile.company_address && (
                            <div>
                              <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                                Company Address
                              </Typography>
                              <Typography variant="paragraph" className="font-normal text-gray-900">
                                {selectedUser.profile.company_address}
                              </Typography>
                            </div>
                          )}
                          {selectedUser.profile.investment_preferences && (
                            <div>
                              <Typography variant="small" color="gray" className="font-bold uppercase tracking-wide">
                                Investment Preferences
                              </Typography>
                              <div className="mt-2 space-y-1">
                                <Typography variant="small" className="font-normal text-gray-700">
                                  Industries: {selectedUser.profile.investment_preferences.preferred_industry?.map(getIndustryLabel).join(', ')}
                                </Typography>
                                <Typography variant="small" className="font-normal text-gray-700 capitalize">
                                  Stages: {selectedUser.profile.investment_preferences.preferred_funding_stage?.map(getFundingStageLabel).join(', ')}
                                </Typography>
                                <Typography variant="small" className="font-normal text-gray-700">
                                  Amount Range: {selectedUser.profile.investment_preferences.investment_amount_range}
                                </Typography>
                                <Typography variant="small" className="font-normal text-gray-700">
                                  Revenue Share: {selectedUser.profile.investment_preferences.revenue_share_percentage}%
                                </Typography>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="p-6 max-md:p-4 max-sm:p-3 bg-gray-50 rounded-b-2xl">
          <Button 
            onClick={closeUserModal}
            className="bg-dark-plum hover:bg-light-purple text-white font-semibold capitalize px-6 max-md:px-4 max-sm:px-3"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Create Account Modal */}
      <Dialog 
        open={showCreateModal} 
        handler={closeCreateModal} 
        size="xl" 
        className="rounded-2xl max-w-[95vw] max-h-[95vh]"
        placeholder={undefined}
        style={{ zIndex: 9999 }}
      >
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Create New {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 max-md:p-6 max-sm:p-4 max-h-[70vh] overflow-y-auto bg-beige">
          <div className="space-y-6">
            {/* Account Type Selector */}
            <div>
            <Typography variant="h6" className="mb-3 font-bold text-dark-plum">
              Account Type
            </Typography>
            <div className="flex gap-4">
              <Button
                variant={accountType === 'startup' ? 'filled' : 'outlined'}
                className={clsx(
                  "flex items-center gap-2 capitalize",
                  accountType === 'startup' && "bg-dark-plum text-white hover:bg-dark-plum/80",
                  accountType === 'investor' && "bg-transparent border border-dark-plum text-dark-plum hover:bg-light-purple hover:text-white"
                )}
                onClick={() => setAccountType('startup')}
              >
                <BuildingOfficeIcon className="h-4 w-4" />
                Startup
              </Button>
              <Button
                variant={accountType === 'investor' ? 'filled' : 'outlined'}
                className={clsx(
                  "flex items-center gap-2 capitalize",
                  accountType === 'investor' && "bg-dark-plum text-white hover:bg-dark-plum/80",
                  accountType === 'startup' && "bg-transparent border border-dark-plum text-dark-plum hover:bg-light-purple hover:text-white"
                )}
                onClick={() => setAccountType('investor')}
              >
                <UserGroupIcon className="h-4 w-4" />
                Investor
              </Button>
            </div>
          </div>

            {/* Success/Error Messages */}
            {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <Typography variant="small" className="text-green-700 font-medium">
                  {successMessage}
                </Typography>
              </div>
            </div>
          )}

            {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircleIcon className="h-5 w-5 text-red-500" />
                <Typography variant="small" className="text-red-700 font-medium">
                  {errorMessage}
                </Typography>
              </div>
            </div>
          )}

            {/* Startup Form */}
            {accountType === 'startup' && (
              <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-sm:grid-cols-1">
                <div className="flex flex-col">
                    <Input
                        id="startup-name"
                        type="text"
                        label="Full Name"
                        value={startupForm.name}
                        onChange={(e) => handleStartupChange('name', e.target.value)}
                        onBlur={() => handleStartupBlur('name')}
                        error={!!startupTouched.name && !!formErrors.name}
                        className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    />
                    {startupTouched.name && formErrors.name && (
                        <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.name}
                        </Typography>
                    )}
                </div>

                <div className="flex flex-col">      
                    <Input
                        id="startup-email"
                        type="email"
                        label="Email Address"
                        value={startupForm.email}
                        onChange={(e) => handleStartupChange('email', e.target.value)}
                        onBlur={() => handleStartupBlur('email')}
                        error={!!startupTouched.email && !!formErrors.email}
                        className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    />
                    {startupTouched.email && formErrors.email && (
                        <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.email}
                        </Typography>
                    )}
                </div>

                <div className="flex flex-col">
                    <Input
                        id="startup-password"
                        type="password"
                        label="Password"
                        value={startupForm.password}
                        onChange={(e) => handleStartupChange('password', e.target.value)}
                        onBlur={() => handleStartupBlur('password')}
                        error={!!startupTouched.password && !!formErrors.password}
                        className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    />
                    {startupTouched.password && formErrors.password && (
                        <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.password}
                        </Typography>
                    )}
                </div>

                <div className="flex flex-col">
                    <Input
                        id="startup-contact"
                        type="text"
                        label="Contact Number"
                        value={startupForm.contact_no}
                        onChange={(e) => handleStartupChange('contact_no', e.target.value)}
                        onBlur={() => handleStartupBlur('contact_no')}
                        error={!!startupTouched.contact_no && !!formErrors.contact_no}
                        className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                    />
                    {startupTouched.contact_no && formErrors.contact_no && (
                        <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.contact_no}
                        </Typography>
                    )} 
                </div>

                <div className="flex flex-col">
                    <Input
                        id="startup-company"
                        type="text"
                        label="Company Name"
                        value={startupForm.company_name}
                        onChange={(e) => handleStartupChange('company_name', e.target.value)}
                        onBlur={() => handleStartupBlur('company_name')}
                        error={!!startupTouched.company_name && !!formErrors.company_name}
                        className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal md:col-span-2"
                    />
                    {startupTouched.company_name && formErrors.company_name && (
                        <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.company_name}
                        </Typography>
                    )}
                </div>

                <div className="flex flex-col overflow-visible relative z-[1000]">
                    <Select
                        id="startup-company-sector"
                        label="Select your sector"
                        value={startupForm.company_sector}
                        onChange={(value) => {
                        handleStartupChange('company_sector', value || '');
                        setStartupTouched(prev => ({ ...prev, company_sector: true }));
                        }}
                        error={!!startupTouched.company_sector && !!formErrors.company_sector}
                        className="bg-white text-blue-gray300"
                        containerProps={{ className: "relative z-[1000] overflow-visible" }}
                        menuProps={{ className: "z-[9999] !top-auto !inset-auto" }}
                        size="lg"
                    >
                        {industryOptions.map((industry) => (
                        <Option key={industry.value} value={industry.value}>
                            {industry.label}
                        </Option>
                        ))}
                    </Select>
                    {startupTouched.company_sector && formErrors.company_sector && (
                        <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.company_sector}
                        </Typography>
                    )}
                </div>

                <div className="flex flex-col">
                    <Textarea
                        label="Company Address"
                        value={startupForm.company_address}
                        onChange={(e) => handleStartupChange('company_address', e.target.value)}
                        onBlur={() => handleStartupBlur('company_address')}
                        error={!!startupTouched.company_address && !!formErrors.company_address}
                        className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal md:col-span-2"
                        size="lg"
                    />
                    {startupTouched.company_address && formErrors.company_address && (
                        <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.company_address}
                        </Typography>
                    )}                    
                </div>
            </div>
          )}

            {/* Investor Form */}
            {accountType === 'investor' && (
              <div className="space-y-6">
              <div className="flex flex-col gap-6">
                <div>
                  <Typography variant="h6" className="mb-3 font-bold text-dark-plum">
                    Investor Type
                  </Typography>
                  <div className="flex gap-4">
                    <Button
                      variant={investorForm.type === 'individual' ? 'filled' : 'outlined'}
                      className={clsx(
                        "flex items-center gap-2 capitalize",
                        investorForm.type === 'individual' && "bg-avocado-green text-gray-900 hover:bg-avocado-green/80",
                        investorForm.type === 'firm' && "bg-transparent border border-gray-900 text-gray-900 hover:bg-avocado-green"
                      )}
                      size="sm"
                      onClick={() => setInvestorForm(prev => ({ ...prev, type: 'individual' }))}
                    >
                      Individual
                    </Button>
                    <Button
                      variant={investorForm.type === 'firm' ? 'filled' : 'outlined'}
                      className={clsx(
                        "flex items-center gap-2 capitalize",
                        investorForm.type === 'firm' && "bg-avocado-green text-gray-900 hover:bg-avocado-green/80",
                        investorForm.type === 'individual' && "bg-transparent border border-gray-900 text-gray-900 hover:bg-avocado-green"
                      )}
                      size="sm"
                      onClick={() => setInvestorForm(prev => ({ ...prev, type: 'firm' }))}
                    >
                      Firm
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col">
                  <Input
                    id="investor-name"
                    type="text"
                    label="Name"
                    value={investorForm.name}
                    onChange={(e) => handleInvestorChange('name', e.target.value)}
                    onBlur={() => setInvestorTouched(prev => ({ ...prev, name: true }))}
                    error={!!investorTouched.name && !!formErrors.name}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  />
                  {investorTouched.name && formErrors.name && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {formErrors.name}
                    </Typography>
                  )}
                </div>

                <div className="flex flex-col">
                  <Input
                    id="investor-contact"
                    type="text"
                    label="Contact Number"
                    value={investorForm.contact_no}
                    onChange={(e) => handleInvestorChange('contact_no', e.target.value)}
                    onBlur={() => setInvestorTouched(prev => ({ ...prev, contact_no: true }))}
                    error={!!investorTouched.contact_no && !!formErrors.contact_no}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  />
                  {investorTouched.contact_no && formErrors.contact_no && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {formErrors.contact_no}
                    </Typography>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <Input
                    id="investor-email"
                    type="email"
                    label="Email Address"
                    value={investorForm.email}
                    onChange={(e) => handleInvestorChange('email', e.target.value)}
                    onBlur={() => setInvestorTouched(prev => ({ ...prev, email: true }))}
                    error={!!investorTouched.email && !!formErrors.email}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  />
                  {investorTouched.email && formErrors.email && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {formErrors.email}
                    </Typography>
                  )}
                </div>

                <div className="flex flex-col">
                  <Input
                    id="investor-password"
                    type="password"
                    label="Password"
                    value={investorForm.password}
                    onChange={(e) => handleInvestorChange('password', e.target.value)}
                    onBlur={() => setInvestorTouched(prev => ({ ...prev, password: true }))}
                    error={!!investorTouched.password && !!formErrors.password}
                    className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  />
                  {investorTouched.password && formErrors.password && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {formErrors.password}
                    </Typography>
                  )}
                </div>

                {investorForm.type === 'individual' ? (
                  <div className="flex flex-col">
                    <Select
                      id="investor-country"
                      label="Select country"
                      className="bg-white text-blue-gray300"
                      value={investorForm.country}
                      onChange={(value) => {
                        handleInvestorChange('country', value || '');
                        setInvestorTouched(prev => ({ ...prev, country: true }));
                      }}
                      error={!!investorTouched.country && !!formErrors.country}
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
                    {investorTouched.country && formErrors.country && (
                      <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.country}
                      </Typography>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Textarea
                      label="Company Address"
                      value={investorForm.company_address}
                      onChange={(e) => handleInvestorChange('company_address', e.target.value)}
                      onBlur={() => setInvestorTouched(prev => ({ ...prev, company_address: true }))}
                      error={!!investorTouched.company_address && !!formErrors.company_address}
                      className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                      size="lg"
                    />
                    {investorTouched.company_address && formErrors.company_address && (
                      <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.company_address}
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
                
                <div className="flex flex-col gap-6">
                  <div>
                    <Typography variant="small" className="mb-2 font-medium text-gray-700">
                      Preferred Industries
                    </Typography>
                    <div className="flex flex-col gap-2 max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                      {industryOptions.map((industry) => (
                        <label key={industry.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={investorForm.investment_preferences.preferred_industry.includes(industry.value)}
                            onChange={(e) => handleIndustryChange(industry.value, e.target.checked)}
                            className="rounded border-gray-300 text-dark-plum focus:ring-light-purple h-5 w-5"
                          />
                          <Typography variant="small" className="text-sm">
                            {industry.label}
                          </Typography>
                        </label>
                      ))}
                    </div>
                    {investorTouched.preferred_industry && formErrors.preferred_industry && (
                      <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.preferred_industry}
                      </Typography>
                    )}
                  </div>

                  <div>
                    <Typography variant="small" className="mb-2 font-medium text-gray-700">
                      Preferred Funding Stages
                    </Typography>
                    <div className="space-y-2 max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                      {['Seed', 'Series A', 'Series B'].map((stage) => (
                        <label key={stage} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={investorForm.investment_preferences.preferred_funding_stage.includes(stage)}
                            onChange={(e) => handleFundingStageChange(stage, e.target.checked)}
                            className="rounded border-gray-300 text-dark-plum focus:ring-light-purple h-5 w-5"
                          />
                          <Typography variant="small" className="text-sm">
                            {stage}
                          </Typography>
                        </label>
                      ))}
                    </div>
                    {investorTouched.preferred_funding_stage && formErrors.preferred_funding_stage && (
                      <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.preferred_funding_stage}
                      </Typography>
                      )}
                  </div>

                <div className="flex flex-col">
                  <Select
                    label="Investment Amount Range"
                    value={investorForm.investment_preferences.investment_amount_range}
                    onChange={(value) => handleInvestorPrefChange('investment_amount_range', value || '')}
                    error={!!investorTouched.investment_amount_range && !!formErrors.investment_amount_range}
                    className="bg-white text-blue-gray300"
                    size="lg"
                  >
                    {investmentAmountOptions.map((amount) => (
                      <Option key={amount} value={amount}>
                        {amount}
                      </Option>
                    ))}
                  </Select>
                  {investorTouched.investment_amount_range && formErrors.investment_amount_range && (
                    <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                      {formErrors.investment_amount_range}
                    </Typography>
                  )}
                </div>

                  <div className="flex flex-col"> 
                    <Input
                        label="Revenue Share Percentage"
                        type="number"
                        value={investorForm.investment_preferences.revenue_share_percentage}
                        onChange={(e) => handleInvestorPrefChange('revenue_share_percentage', parseFloat(e.target.value) || 0)}
                        error={!!investorTouched.revenue_share_percentage && !!formErrors.revenue_share_percentage}
                        className="bg-white text-blue-gray300 "
                        size="lg"
                    />
                    {investorTouched.revenue_share_percentage && formErrors.revenue_share_percentage && (
                        <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                        {formErrors.revenue_share_percentage}
                        </Typography>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </DialogBody>
        <DialogFooter className="p-6 max-md:p-4 max-sm:p-3 bg-gray-50 rounded-b-2xl">
          <Button 
            variant="text" 
            onClick={closeCreateModal}
            className="mr-3 max-md:mr-2 max-sm:mr-1 font-semibold capitalize"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateAccount} 
            disabled={submitting}
            className="bg-dark-plum hover:bg-light-purple text-white font-semibold capitalize px-6 max-md:px-4 max-sm:px-3"
          >
            {submitting ? <Spinner className="h-5 w-5" /> : 'Create Account'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} handler={closeChangePasswordModal} size="md" className="rounded-2xl max-w-[95vw] max-h-[95vh]" placeholder={undefined}>
        <DialogHeader className="bg-avocado-green rounded-t-2xl">
          <Typography variant="h4" color="blue-gray" className="font-bold">
            Change Password
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 max-md:p-6 max-sm:p-4 max-h-[70vh] overflow-y-auto bg-beige">
          {selectedUser && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                </div>
                <Typography variant="h5" className="mb-2 font-semibold text-gray-900">
                  Change Password for {selectedUser.profile?.name || selectedUser.email}
                </Typography>
                <Typography variant="paragraph" color="gray" className="text-lg">
                  Enter a new password for this user account
                </Typography>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                     <Input
                     id="new-password"
                     type="password"
                     label="New Password"
                     value={passwordForm.new_password}
                     onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                     onBlur={() => handlePasswordBlur('new_password')}
                     error={!!passwordErrors.new_password}
                     className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                     />
                     {passwordErrors.new_password && (
                     <Typography variant="small" color="red" className="mt-1 font-normal text-sm">
                         {passwordErrors.new_password}
                     </Typography>
                     )}
                 </div>

                 <div className="flex flex-col">
                     <Input
                     id="confirm-password"
                     type="password"
                     label="Confirm New Password"
                     value={passwordForm.confirm_password}
                     onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                     onBlur={() => handlePasswordBlur('confirm_password')}
                     error={!!passwordErrors.confirm_password}
                     className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                     />
                     {passwordErrors.confirm_password && (
                     <Typography variant="small" color="red" className="mt-1 font-normal text-sm">
                         {passwordErrors.confirm_password}
                     </Typography>
                     )}
                 </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Typography variant="small" className="text-blue-700 font-medium">
                  <strong>Note:</strong> The user will need to use this new password to log in. 
                  Make sure to communicate the new password to the user securely.
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="p-6 max-md:p-4 max-sm:p-3 bg-gray-50 rounded-b-2xl">
          <Button 
            variant="text" 
            onClick={closeChangePasswordModal}
            className="mr-3 max-md:mr-2 max-sm:mr-1 font-semibold capitalize"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            disabled={changingPassword}
            className="bg-avocado-green hover:bg-avocado-green/80 text-blue-gray font-semibold capitalize px-6 max-md:px-4 max-sm:px-3"
          >
            {changingPassword ? <Spinner className="h-5 w-5" /> : 'Change Password'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
