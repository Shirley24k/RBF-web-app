import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  EyeIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline";
import {
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
  Typography
} from "@material-tailwind/react";
import axios from "axios";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import coinCirclingWallet from "../../assets/coin circling wallet.json";
import { ChangePasswordModal } from "../../components/ChangePasswordModal";
import AppButton from "../../components/ui/AppButton";
import { Sidenav } from "../../components/ui/sidenav";
import { isValidPhoneNumber } from "../../lib/utils";
import { getIndustryLabel, industryOptions } from "../../utils/industryOptions";


interface StaffMember {
  id: number;
  user_id: number;
  name: string;
  position: string;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  user: {
    id: number;
    email: string;
  };
}

interface Permission {
  key: string;
  label: string;
}

interface StartupInfo {
  id: number;
  name: string;
  company_name: string;
  contact_no: string;
  company_address: string;
  company_sector: string;
  user: {
    id: number;
    email: string;
  };
}

export const StartupProfile = (): JSX.Element => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [startupInfo, setStartupInfo] = useState<StartupInfo | null>(null);
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    password: '',
    permissions: [] as string[]
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  

  // Profile edit form states
  const [profileFormData, setProfileFormData] = useState({
    startup_name: '',
    contact_no: '',
    company_name: '',
    company_sector: '',
    company_address: '',
    password: '',
    confirm_password: ''
  });
  const [profileFormErrors, setProfileFormErrors] = useState<Record<string, string>>({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const validateInviteField = (name: 'name' | 'email' | 'position' | 'password', value: string): string | undefined => {
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
      case 'position':
        return !value.trim() ? 'Position is required' : undefined;
      default:
        return undefined;
    }
  };

  const handleInviteChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'permissions') return;
    const err = validateInviteField(field as any, value);
    setFormErrors(prev => ({ ...prev, [field]: err || '' }));
    if (!err) setFormErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchUserRole();
      await fetchStartupInfo();
      
      setLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (userRole === 'startup') {
      fetchStaff();
      fetchPermissions();
    }
  }, [userRole]);

  const fetchUserRole = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        setUserRole(response.data.role);
        // If user is staff, also set staff info
        if (response.data.role === 'staff' && response.data.staff) {
          setStaffInfo(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setStaff(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      if (error.response?.status === 403) {
        alert('Only startup owners can access staff management.');
        window.history.back();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStartupInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/startup/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Startup profile response:', response.data);
      
      if (response.data.data) {
        setStartupInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching startup info:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        const permissions = Object.entries(response.data.available_permissions).map(([key, label]) => ({
          key,
          label: label as string
        }));
        setAvailablePermissions(permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleInviteStaff = async () => {
    // client-side validate first
    const errors: Record<string, string> = {};
    (['name','email','position','password'] as const).forEach((k) => {
      const v = String((formData as any)[k] ?? '');
      const e = validateInviteField(k, v);
      if (e) errors[k] = e;
    });
    if ((formData.permissions || []).length === 0) {
      errors.permissions = 'Please select at least one permission';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const response = await axios.post(`${API_BASE_URL}/staff`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setShowInviteModal(false);
        resetForm();
        fetchStaff();
        alert('Staff member invited successfully!');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert('Error inviting staff member: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStaff = async () => {
    const errors: Record<string, string> = {};
    (['name','position'] as const).forEach((k) => {
      const v = String((formData as any)[k] ?? '');
      const e = validateInviteField(k, v);
      if (e) errors[k] = e;
    });
    if ((formData.permissions || []).length === 0) {
      errors.permissions = 'Please select at least one permission';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (!selectedStaff) return;

    setSubmitting(true);
    setFormErrors({});

    try {
      // Filter out any invalid permissions before sending to backend
      const validPermissions = formData.permissions.filter(permission => {
        return availablePermissions.some(available => available.key === permission);
      });

      const response = await axios.put(`${API_BASE_URL}/staff/${selectedStaff.id}`, {
        name: formData.name,
        position: formData.position,
        permissions: validPermissions
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setShowEditModal(false);
        resetForm();
        fetchStaff();
        alert('Staff member updated successfully!');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert('Error updating staff member: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    setSubmitting(true);

    try {
      const response = await axios.delete(`${API_BASE_URL}/staff/${selectedStaff.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setShowDeleteModal(false);
        fetchStaff();
        alert('Staff member deactivated successfully!');
      }
    } catch (error: any) {
      alert('Error deactivating staff member: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const openInviteModal = () => {
    resetForm();
    setShowInviteModal(true);
  };

  const openEditModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.user.email,
      position: staffMember.position || '',
      password: '',
      permissions: staffMember.permissions
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openViewModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setShowViewModal(true);
  };

  const openDeleteModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      position: '',
      password: '',
      permissions: []
    });
    setFormErrors({});
    setSelectedStaff(null);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => {
      const nextPermissions = checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission);
      // Real-time validation for permissions: require at least one
      if (nextPermissions.length === 0) {
        setFormErrors(prevErrs => ({ ...prevErrs, permissions: 'Please select at least one permission' }));
      } else {
        setFormErrors(prevErrs => { const { permissions, ...rest } = prevErrs; return rest; });
      }
      return { ...prev, permissions: nextPermissions };
    });
  };

  // Profile edit validation and handlers
  const validateProfileField = (name: 'startup_name' | 'contact_no' | 'company_name' | 'company_sector' | 'company_address' | 'password' | 'confirm_password', value: string): string | undefined => {
    switch (name) {
      case 'startup_name':
        return !value.trim() ? 'Full name is required' : undefined;
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
      case 'password':
        if (!value) return undefined; // Password is optional
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      case 'confirm_password':
        if (!profileFormData.password) return undefined; // Only validate if password is provided
        if (!value) return 'Confirm password is required';
        if (profileFormData.password !== value) return 'Passwords do not match';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleProfileChange = (field: keyof typeof profileFormData, value: string) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }));
    const err = validateProfileField(field as any, value);
    setProfileFormErrors(prev => ({ ...prev, [field]: err || '' }));
    if (!err) {
      setProfileFormErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
    }
  };

  const openEditProfileModal = () => {
    if (startupInfo) {
      setProfileFormData({
        startup_name: startupInfo.name,
        contact_no: startupInfo.contact_no,
        company_name: startupInfo.company_name,
        company_sector: startupInfo.company_sector,
        company_address: startupInfo.company_address,
        password: '',
        confirm_password: ''
      });
      setProfileFormErrors({});
    }
    setShowEditProfileModal(true);
  };

  const handleUpdateProfile = async () => {
    // Client-side validation
    const errors: Record<string, string> = {};
    (['startup_name', 'contact_no', 'company_name', 'company_sector', 'company_address', 'password', 'confirm_password'] as const).forEach((k) => {
      const v = String((profileFormData as any)[k] ?? '');
      const e = validateProfileField(k, v);
      if (e) errors[k] = e;
    });
    if (Object.keys(errors).length > 0) { 
      setProfileFormErrors(errors); 
      return; 
    }

    setProfileSubmitting(true);
    setProfileFormErrors({});

    try {
      // Only include password if it's provided
      const updateData = {
        name: profileFormData.startup_name,
        contact_no: profileFormData.contact_no,
        company_name: profileFormData.company_name,
        company_sector: profileFormData.company_sector,
        company_address: profileFormData.company_address,
        ...(profileFormData.password && {
          password: profileFormData.password,
          confirm_password: profileFormData.confirm_password
        })
      };
      
      const response = await axios.put(`${API_BASE_URL}/startup/profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setShowEditProfileModal(false);
        fetchStartupInfo();
        alert('Profile updated successfully!');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setProfileFormErrors(error.response.data.errors);
      } else {
        alert('Error updating profile: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setProfileSubmitting(false);
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
        <div className="px-6 py-8 lg:px-8 xl:px-12 max-md:px-4 max-sm:px-3">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="w-full">
              <div className="mb-16 max-lg:mb-12 max-sm:mb-8">
                <div className="flex flex-row lg:items-center lg:justify-between gap-4 max-sm:gap-2">
                  <div className="flex-1">
                    <Typography variant="h4" className="text-4xl max-lg:text-3xl max-sm:text-2xl font-bold text-gray-900 mb-6 max-lg:mb-4 max-sm:mb-3">
                      Organization Management
                    </Typography>
                    <Typography variant="paragraph" className="text-xl max-lg:text-base max-sm:text-sm text-gray-600 max-w-2xl">
                      Manage your company details and team members
                    </Typography>
                  </div>
                  {userRole === 'startup' && (
                    <div className="flex-shrink-0">
                      <AppButton
                        variant="primary"
                        size="lg"
                        className="flex items-center gap-3"
                        onClick={openInviteModal}
                      >
                        <UserPlusIcon className="hidden sm:block h-5 w-5" />
                        <span className="max-sm:hidden">Invite Staff Member</span>
                        <span className="sm:hidden">Invite Staff</span>
                      </AppButton>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
          {/* Company Details */}
          {userRole == "startup" && startupInfo && (
            <Card className="mb-8 max-md:mb-6 max-sm:mb-4 shadow-xl border-0 rounded-xl overflow-hidden">
              <CardHeader
                variant="gradient"
                className="bg-gradient-to-r from-dark-plum to-light-purple mb-0 grid mx-0 my-0 py-3 max-md:py-2 place-items-center"
              >
                <div className="flex flex-row items-center justify-between w-full px-4 max-sm:px-2 gap-2 max-sm:gap-1">
                  <Typography variant="h4" color="white" className="flex items-center gap-3 font-bold text-2xl max-md:text-xl max-sm:text-lg">
                    <BuildingOfficeIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4" />
                    Company Information
                  </Typography>
                  <div className="flex items-center gap-3 max-sm:gap-2">
                    <AppButton
                        variant="text"
                        className="text-white hover:bg-transparent p-2 max-sm:p-1"
                        onClick={() => setShowChangePasswordModal(true)}
                      >
                        <ShieldCheckIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                      </AppButton>
                      <AppButton
                        variant="text"
                        className="text-white hover:bg-transparent p-2 max-sm:p-1"
                        onClick={openEditProfileModal}
                      >
                        <PencilIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                      </AppButton>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-8 max-md:p-6 max-sm:p-4">
                <div className="flex flex-col gap-4 max-md:gap-3 max-sm:gap-2">
                  <div className="space-y-6 max-md:space-y-4 max-sm:space-y-3">
                    <div>
                      <Typography variant="h4" className="mb-4 max-md:mb-3 max-sm:mb-2 font-bold text-dark-plum text-2xl max-md:text-xl max-sm:text-lg">
                        {startupInfo.name}
                      </Typography>
                      <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
                        <div className="flex items-start gap-4 max-sm:gap-3 p-4 max-md:p-3 max-sm:p-2 bg-gray-50 rounded-lg">
                          <EnvelopeIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4 text-dark-plum flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide text-sm max-sm:text-xs">
                              Email Address
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs break-all">
                              {startupInfo.user.email}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 max-sm:gap-3 p-4 max-md:p-3 max-sm:p-2 bg-gray-50 rounded-lg">
                          <PhoneIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4 text-dark-plum flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide text-sm max-sm:text-xs">
                              Contact Number
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs">
                              {startupInfo.contact_no}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 max-sm:gap-3 p-4 max-md:p-3 max-sm:p-2 bg-gray-50 rounded-lg">
                          <BuildingOfficeIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4 text-dark-plum flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide text-sm max-sm:text-xs">
                              Company Name
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs">
                              {startupInfo.company_name}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 max-sm:gap-3 p-4 max-md:p-3 max-sm:p-2 bg-gray-50 rounded-lg">
                          <MapPinIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4 text-dark-plum flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide text-sm max-sm:text-xs">
                              Company Address
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs">
                              {startupInfo.company_address}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 max-sm:gap-3 p-4 max-md:p-3 max-sm:p-2 bg-gray-50 rounded-lg">
                          <BriefcaseIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4 text-dark-plum flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide text-sm max-sm:text-xs">
                              Company Sector
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs">
                              {getIndustryLabel(startupInfo.company_sector)}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Staff Details Card - Only show when user role is staff */}
          {userRole === 'staff' && startupInfo && (
            <Card className="mb-8 max-md:mb-6 max-sm:mb-4 shadow-xl border-0 rounded-xl overflow-hidden">
              <CardHeader
                variant="gradient"
                className="bg-gradient-to-r from-dark-plum to-light-purple mb-0 grid mx-0 my-0 py-3 max-md:py-2 place-items-center"
              >
                <div className="flex flex-row items-center justify-between w-full px-4 max-sm:px-2 gap-2 max-sm:gap-1">
                  <Typography variant="h4" color="white" className="flex items-center gap-3 font-bold text-2xl max-md:text-xl max-sm:text-lg">
                    <UserIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4" />
                    Staff Information
                  </Typography>
                  <div className="flex items-center gap-3 max-sm:gap-2">
                    <AppButton
                      variant="text"
                      className="text-white hover:bg-transparent p-2 max-sm:p-1"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      <ShieldCheckIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                    </AppButton>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-8 max-md:p-6 max-sm:p-4">
                <div className="flex flex-col gap-4">
                  <div className="space-y-6">
                    <div>
                      <Typography variant="h4" className="mb-4 font-bold text-dark-plum">
                        {staffInfo?.staff?.name || 'Staff Name'}
                      </Typography>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <EnvelopeIcon className="h-6 w-6 text-dark-plum flex-shrink-0" />
                          <div>
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                              Email Address
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900">
                              {staffInfo.email}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <PhoneIcon className="h-6 w-6 text-dark-plum flex-shrink-0" />
                          <div>
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                              Contact Number
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900">
                              {startupInfo.contact_no}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <BuildingOfficeIcon className="h-6 w-6 text-dark-plum flex-shrink-0" />
                          <div>
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                              Company Name
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900">
                              {startupInfo.company_name}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <MapPinIcon className="h-6 w-6 text-dark-plum flex-shrink-0" />
                          <div>
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                              Company Address
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900">
                              {startupInfo.company_address}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Organization Members */}
          {userRole === 'startup' && (
          <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardHeader
              variant="gradient"
              className="bg-gradient-to-r from-dark-plum to-light-purple mx-0 my-0 grid py-3 max-md:py-2 place-items-center"
            >
              <Typography variant="h4" color="white" className="flex items-center gap-3 font-bold text-2xl max-md:text-xl max-sm:text-lg">
                <UserIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4" />
                Organization Members ({staff.length})
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              {staff.length === 0 ? (
                <div className="text-center py-12 max-md:py-8 max-sm:py-6 flex flex-col items-center justify-center gap-4 max-sm:gap-2">
                  <div className="w-24 h-24 max-md:w-20 max-md:h-20 max-sm:w-16 max-sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 max-md:mb-4 max-sm:mb-3">
                    <UserIcon className="h-12 w-12 max-md:h-10 max-md:w-10 max-sm:h-8 max-sm:w-8 text-gray-400" />
                  </div>
                  <Typography variant="h5" color="gray" className="mb-3 max-md:mb-2 max-sm:mb-1 font-semibold text-2xl max-md:text-xl max-sm:text-lg">
                    No Team Members Yet
                  </Typography>
                  <Typography variant="paragraph" color="gray" className="mb-6 max-md:mb-4 max-sm:mb-3 text-lg max-md:text-base max-sm:text-sm px-4">
                    Start building your team by inviting staff members to collaborate
                  </Typography>
                  <AppButton 
                    variant="primary"
                    size="lg"
                    className="flex items-center gap-2 max-sm:gap-1"
                    onClick={openInviteModal}
                  >
                    <UserPlusIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                    <span className="max-sm:hidden">Invite Team Member</span>
                    <span className="sm:hidden">Invite Member</span>
                  </AppButton>
                </div>
              ) : (
                <div className="w-full">
                  <table className="w-full table-auto">
                    <thead className="border-b border-blue-gray-50">
                      <tr className="bg-gray-50">
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                            Name
                          </Typography>
                        </th>
                        <th className="hidden sm:block py-4 px-6 text-left">
                          <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                            Status
                          </Typography>
                        </th>
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="text-md max-md:text-sm max-sm:text-xs font-bold text-blue-gray-600 tracking-wide">
                            Actions
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((member) => {
                        return (
                          <tr key={member.id} className="hover:bg-gray-50 transition-colors border-b border-blue-gray-50">
                            <td className="py-4 px-6 max-md:px-4 max-sm:px-3">
                              <div className="flex items-center gap-3 max-sm:gap-2">
                                <div className="w-10 h-10 max-sm:w-8 max-sm:h-8 bg-dark-plum/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-dark-plum" />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <Typography variant="small" className="font-semibold text-gray-900 text-base max-md:text-sm max-sm:text-xs truncate">
                                    {member.name}
                                  </Typography>
                                  <Typography variant="small" color="gray" className="text-xs">
                                    ID: {member.id}
                                  </Typography>
                                  {/* Show status on mobile under the name */}
                                  <div className="sm:hidden mt-1">
                                    <span className="text-xs font-medium text-gray-600">{member.status}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="hidden sm:table-cell py-4 px-6">
                              <div className="flex items-center">
                                <span className="text-sm max-md:text-xs max-sm:text-[10px] font-medium">{member.status}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 flex items-center justify-start">
                              <div className="flex items-center gap-2 max-sm:gap-1 justify-end">
                                <AppButton
                                  size="sm"
                                  variant="text"
                                  className="p-2 max-sm:p-1"
                                  onClick={() => openViewModal(member)}
                                  title="View"
                                >
                                  <EyeIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                </AppButton>
                                <AppButton
                                  size="sm"
                                  variant="text"
                                  className="p-2 max-sm:p-1"
                                  onClick={() => openEditModal(member)}
                                >
                                  <PencilIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                </AppButton>
                                <AppButton
                                  size="sm"
                                  variant="text"
                                  className="p-2 max-sm:p-1"
                                  onClick={() => openDeleteModal(member)}
                                  disabled={member.status === 'INACTIVE'}
                                >
                                  <TrashIcon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                                </AppButton>
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
          )}
          </div>
        </div>
      </main>

      {/* Invite Staff Modal */}
      <Dialog 
        open={showInviteModal} 
        handler={() => setShowInviteModal(false)} 
        size="lg" 
        className="rounded-2xl"
        placeholder={undefined}
      >
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Invite New Team Member
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 max-h-[70vh] overflow-y-auto bg-beige">
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-sm:grid-cols-1">
            <div className="flex flex-col">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInviteChange('name', e.target.value)}
              error={!!formErrors.name}
              className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
              {formErrors.name && (
                <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                {formErrors.name}
              </Typography>
            )}
            </div>

            <div className="flex flex-col">
            <Input
                label="Position"
                value={formData.position}
                onChange={(e) => handleInviteChange('position', e.target.value)}
                error={!!formErrors.position}
                className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
              {formErrors.position && (
                <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                  {formErrors.position}
              </Typography>
            )}
            </div>

            <div className="flex flex-col">
            <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInviteChange('email', e.target.value)}
                error={!!formErrors.email}
                className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
              {formErrors.email && (
                <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                  {formErrors.email}
              </Typography>
            )}
            </div>

            <div className="flex flex-col">
            <Input
              label="Password"
              type="password"
              value={formData.password}
                onChange={(e) => handleInviteChange('password', e.target.value)}
                error={!!formErrors.password}
                className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
              {formErrors.password && (
                <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                {formErrors.password}
              </Typography>
            )}
            </div>

            <div>
              <Typography variant="h6" className="mb-4 font-bold text-dark-plum">
                Permissions
              </Typography>
              <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                {availablePermissions.map((permission) => (
                  <label key={permission.key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.key)}
                      onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                      className="rounded border-gray-300 text-dark-plum focus:ring-light-purple h-5 w-5"
                    />
                    <Typography variant="paragraph" className="font-medium text-gray-900">
                      {permission.label}
                    </Typography>
                  </label>
                ))}
              </div>
              {formErrors.permissions && (
                <Typography variant="small" color="red" className="mt-2 font-medium">
                  {formErrors.permissions}
                </Typography>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-4">
          <AppButton 
            variant="text" 
            size="lg"
            onClick={() => setShowInviteModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton 
            variant="primary"
            size="lg"
            onClick={handleInviteStaff} 
            disabled={submitting}
            loading={submitting}
          >
            Send Invitation
          </AppButton>
        </DialogFooter>
      </Dialog>

      {/* View Staff Modal */}
      <Dialog open={showViewModal} handler={() => setShowViewModal(false)} size="lg" className="rounded-2xl" placeholder={undefined}>
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Staff Details
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 max-h-[70vh] overflow-y-auto bg-beige">
          {selectedStaff && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                <div>
                  <Typography variant="h6" className="mb-3 font-bold text-dark-plum">
                    Basic Information
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                        Name
                      </Typography>
                      <Typography variant="paragraph" className="font-semibold text-gray-900">
                        {selectedStaff.name}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                        Email
                      </Typography>
                      <Typography variant="paragraph" className="font-semibold text-gray-900">
                        {selectedStaff.user.email}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                        Position
                      </Typography>
                      <Typography variant="paragraph" className="font-semibold text-gray-900">
                        {selectedStaff.position || 'Not specified'}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                        Status
                      </Typography>
                      <Typography variant="paragraph" className="font-semibold text-gray-900">
                        {selectedStaff.status}
                      </Typography>
                    </div>
                  </div>
                </div>

                <div>
                  <Typography variant="h6" className="mb-3 font-bold text-dark-plum">
                    Permissions
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {selectedStaff.permissions.length === 0 ? (
                      <Typography variant="small" color="gray">No permissions</Typography>
                    ) : (
                      selectedStaff.permissions.map((permission) => (
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
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl">
          <AppButton 
            variant="primary"
            size="lg"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </AppButton>
        </DialogFooter>
      </Dialog>

      {/* Edit Staff Modal */}
      <Dialog open={showEditModal} handler={() => setShowEditModal(false)} size="lg" className="rounded-2xl" placeholder={undefined}>
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Edit Team Member
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 max-h-[70vh] overflow-y-auto bg-beige">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInviteChange('name', e.target.value)}
              error={!!formErrors.name}
              className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
            {formErrors.name && (
                <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                {formErrors.name}
              </Typography>
            )}
            </div>

            <div className="flex flex-col">
            <Input
              label="Position"
              value={formData.position}
              onChange={(e) => handleInviteChange('position', e.target.value)}
              error={!!formErrors.position}
              className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
            {formErrors.position && (
                <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                {formErrors.position}
              </Typography>
            )}
            </div>

            <div>
              <Typography variant="h6" className="mb-4 font-bold text-dark-plum">
                Permissions
              </Typography>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1 max-h-48 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                {availablePermissions.map((permission) => (
                  <label key={permission.key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.key)}
                      onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                      className="rounded border-gray-300 text-dark-plum focus:ring-light-purple h-5 w-5"
                    />
                    <Typography variant="paragraph" className="font-medium text-gray-900">
                      {permission.label}
                    </Typography>
                  </label>
                ))}
              </div>
              {formErrors.permissions && (
                <Typography variant="small" color="red" className="mt-2 font-medium">
                  {formErrors.permissions}
                </Typography>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-4">
          <AppButton 
            variant="text" 
            size="lg"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton 
            variant="primary"
            size="lg" 
            onClick={handleUpdateStaff} 
            disabled={submitting}
            loading={submitting}
          >
            Update Member
          </AppButton>
        </DialogFooter>
      </Dialog>

      {/* Delete Staff Modal */}
      <Dialog open={showDeleteModal} handler={() => setShowDeleteModal(false)} size="md" className="rounded-2xl" placeholder={undefined}>
        <DialogHeader className="bg-red-900 text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Deactivate Team Member
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 max-h-[70vh] overflow-y-auto bg-beige">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="h-8 w-8 text-red-500" />
            </div>
            <Typography variant="h5" color="gray" className="mb-4 font-semibold">
              Are you sure you want to deactivate <span className="text-red-700 font-bold">{selectedStaff?.name}</span>?
            </Typography>
            <Typography variant="paragraph" color="gray" className="text-lg">
              This will revoke their access to the system and they will no longer be able to perform any actions.
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-4">
          <AppButton 
            variant="text" 
            size="lg"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton 
            variant="danger"
            size="lg"
            onClick={handleDeleteStaff} 
            disabled={submitting}
            loading={submitting}
          >
            Deactivate
          </AppButton>
        </DialogFooter>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfileModal} handler={() => setShowEditProfileModal(false)} size="lg" className="rounded-2xl" placeholder={undefined}>
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Edit Company Profile
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 bg-beige">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <Input
                  label="Full Name"
                  value={profileFormData.startup_name}
                  onChange={(e) => handleProfileChange('startup_name', e.target.value)}
                  error={!!profileFormErrors.startup_name}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  size="lg"
                />
                {profileFormErrors.startup_name && (
                  <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                    {profileFormErrors.startup_name}
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
                  size="lg"
                />
                {profileFormErrors.contact_no && (
                  <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                    {profileFormErrors.contact_no}
                  </Typography>
                )}
              </div>

              <div className="flex flex-col">
                <Input
                  label="Company Name"
                  value={profileFormData.company_name}
                  onChange={(e) => handleProfileChange('company_name', e.target.value)}
                  error={!!profileFormErrors.company_name}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  size="lg"
                />
                {profileFormErrors.company_name && (
                  <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                    {profileFormErrors.company_name}
                  </Typography>
                )}
              </div>

              <div className="flex flex-col">
                <Select
                  label="Select your sector"
                  value={profileFormData.company_sector}
                  onChange={(value) => {
                    handleProfileChange('company_sector', value || '');
                  }}
                  error={!!profileFormErrors.company_sector}
                  className="bg-white text-blue-gray300"
                  size="lg"
                  menuProps={{
                    className: "z-[9999]",
                    style: { zIndex: 9999 }
                  }}
                >
                  {industryOptions.map((industry) => (
                    <Option key={industry.value} value={industry.value}>
                      {industry.label}
                    </Option>
                  ))}
                </Select>
                {profileFormErrors.company_sector && (
                  <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                    {profileFormErrors.company_sector}
                  </Typography>
                )}
              </div>

              <div className="flex flex-col col-span-2">
                <Input
                  label="Company Address"
                  value={profileFormData.company_address}
                  onChange={(e) => handleProfileChange('company_address', e.target.value)}
                  error={!!profileFormErrors.company_address}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  size="lg"
                />
                {profileFormErrors.company_address && (
                  <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                    {profileFormErrors.company_address}
                  </Typography>
                )}
              </div>
            </div>
        </DialogBody>
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl">
          <AppButton 
            variant="text" 
            size="lg"
            onClick={() => setShowEditProfileModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton 
            variant="primary"
            size="lg"
            onClick={handleUpdateProfile} 
            disabled={profileSubmitting}
            loading={profileSubmitting}
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
