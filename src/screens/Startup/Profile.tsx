import {
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
  Typography
} from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChangePasswordModal } from "../../components/ChangePasswordModal";
import { Sidenav } from "../../components/sidenav";
import { isValidPhoneNumber } from "../../lib/utils";
import { industryOptions } from "../../utils/industryOptions";

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
  const [formTouched, setFormTouched] = useState({
    name: false,
    email: false,
    position: false,
    password: false,
  });

  // Profile edit form states
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    contact_no: '',
    company_name: '',
    company_sector: '',
    company_address: '',
    password: '',
    confirm_password: ''
  });
  const [profileFormErrors, setProfileFormErrors] = useState<Record<string, string>>({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileFormTouched, setProfileFormTouched] = useState({
    name: false,
    contact_no: false,
    company_name: false,
    company_sector: false,
    company_address: false,
    password: false,
    confirm_password: false,
  });

  // Staff change password form state
  const [changePasswordData, setChangePasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [changePasswordTouched, setChangePasswordTouched] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState<Record<string, string>>({});
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordSubmitting, setChangePasswordSubmitting] = useState(false);

  const validateInviteField = (name: keyof typeof formTouched, value: string): string | undefined => {
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
    const key = field as keyof typeof formTouched;
    const err = validateInviteField(key, value);
    setFormErrors(prev => ({ ...prev, [field]: err || '' }));
    if (!err) {
      setFormErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
    }
  };

  const handleInviteBlur = (field: keyof typeof formTouched) => {
    setFormTouched(prev => ({ ...prev, [field]: true }));
    const value = String((formData as any)[field] ?? '');
    const err = validateInviteField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: err || '' }));
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
    (['name','email','position','password'] as Array<keyof typeof formTouched>).forEach(k => {
      const v = String((formData as any)[k] ?? '');
      const e = validateInviteField(k, v);
      if (e) errors[k] = e;
    });
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormTouched({ name: true, email: true, position: true, password: true });
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
        setFormTouched({ name: true, email: true, position: true, password: true });
      } else {
        alert('Error inviting staff member: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;

    setSubmitting(true);
    setFormErrors({});

    try {
      console.log(formData.permissions)
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
    setFormTouched({ name: false, email: false, position: false, password: false });
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
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  // Profile edit validation and handlers
  const validateProfileField = (name: keyof typeof profileFormTouched, value: string): string | undefined => {
    switch (name) {
      case 'name':
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
    const key = field as keyof typeof profileFormTouched;
    const err = validateProfileField(key, value);
    setProfileFormErrors(prev => ({ ...prev, [field]: err || '' }));
    if (!err) {
      setProfileFormErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
    }
  };

  const handleProfileBlur = (field: keyof typeof profileFormTouched) => {
    setProfileFormTouched(prev => ({ ...prev, [field]: true }));
    const value = String((profileFormData as any)[field] ?? '');
    const err = validateProfileField(field, value);
    setProfileFormErrors(prev => ({ ...prev, [field]: err || '' }));
  };

  const openEditProfileModal = () => {
    if (startupInfo) {
      setProfileFormData({
        name: startupInfo.name,
        contact_no: startupInfo.contact_no,
        company_name: startupInfo.company_name,
        company_sector: startupInfo.company_sector,
        company_address: startupInfo.company_address,
        password: '',
        confirm_password: ''
      });
      setProfileFormErrors({});
      setProfileFormTouched({
        name: false,
        contact_no: false,
        company_name: false,
        company_sector: false,
        company_address: false,
        password: false,
        confirm_password: false,
      });
    }
    setShowEditProfileModal(true);
  };

  const handleUpdateProfile = async () => {
    // Client-side validation
    const errors: Record<string, string> = {};
    (['name', 'contact_no', 'company_name', 'company_sector', 'company_address', 'password', 'confirm_password'] as Array<keyof typeof profileFormTouched>).forEach(k => {
      const v = String((profileFormData as any)[k] ?? '');
      const e = validateProfileField(k, v);
      if (e) errors[k] = e;
    });
    if (Object.keys(errors).length > 0) {
      setProfileFormErrors(errors);
      setProfileFormTouched({ name: true, contact_no: true, company_name: true, company_sector: true, company_address: true, password: true, confirm_password: true });
      return;
    }

    setProfileSubmitting(true);
    setProfileFormErrors({});

    try {
      // Only include password if it's provided
      const updateData = {
        name: profileFormData.name,
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
        setProfileFormTouched({ name: true, contact_no: true, company_name: true, company_sector: true, company_address: true, password: true, confirm_password: true });
      } else {
        alert('Error updating profile: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Staff change password validation and handlers
  const validateChangePasswordField = (name: keyof typeof changePasswordTouched, value: string): string | undefined => {
    switch (name) {
      case 'current_password':
        return !value.trim() ? 'Current password is required' : undefined;
      case 'new_password':
        if (!value.trim()) return 'New password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return undefined;
      case 'confirm_password':
        if (!value.trim()) return 'Confirm password is required';
        if (value !== changePasswordData.new_password) return 'Passwords do not match';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChangePasswordChange = (field: keyof typeof changePasswordData, value: string) => {
    setChangePasswordData(prev => ({ ...prev, [field]: value }));
    const err = validateChangePasswordField(field as keyof typeof changePasswordTouched, value);
    setChangePasswordErrors(prev => ({ ...prev, [field]: err || '' }));
    if (!err) {
      setChangePasswordErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
    }
  };

  const handleChangePasswordBlur = (field: keyof typeof changePasswordTouched) => {
    setChangePasswordTouched(prev => ({ ...prev, [field]: true }));
    const value = String((changePasswordData as any)[field] ?? '');
    const err = validateChangePasswordField(field, value);
    setChangePasswordErrors(prev => ({ ...prev, [field]: err || '' }));
  };

  const submitChangePassword = async () => {
    const errors: Record<string, string> = {};
    (['current_password', 'new_password', 'confirm_password'] as Array<keyof typeof changePasswordTouched>).forEach((k) => {
      const v = String((changePasswordData as any)[k] ?? '');
      const e = validateChangePasswordField(k, v);
      if (e) errors[k] = e;
    });

    if (Object.keys(errors).length > 0) {
      setChangePasswordErrors(errors);
      setChangePasswordTouched({ current_password: true, new_password: true, confirm_password: true });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/change-password`, changePasswordData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'X-Skip-403-Redirect': 'true',
        },
      });
      if (response.data?.success) {
        alert('Password changed successfully');
        setChangePasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setChangePasswordErrors({});
        setChangePasswordTouched({ current_password: false, new_password: false, confirm_password: false });
        setShowChangePasswordModal(false);
      }
    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        // Map backend field errors into local state
        const mapped: Record<string, string> = {};
        Object.keys(apiErrors).forEach((k) => {
          mapped[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : String(apiErrors[k]);
        });
        setChangePasswordErrors(mapped);
        setChangePasswordTouched({ current_password: true, new_password: true, confirm_password: true });
      } else {
        alert('Failed to change password: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block fixed w-32 h-full left-0 top-0 z-20">
        <Sidenav active="profile" />
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidenav active="profile" />
      </div>

      {/* Main content */}
      <div className="flex-1 ml-32 max-md:ml-24 max-sm:ml-20 transition-all duration-300">
        {/* Header */}
        <div className="ml-10 transition-all duration-300">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h3" className="mb-2 font-bold text-dark-plum">
                  Organization Management
                </Typography>
                <Typography variant="paragraph" color="gray" className="font-normal text-lg">
                  Manage your company details and team members
                </Typography>
              </div>
              {userRole === 'startup' && (
              <Button
                className="flex items-center gap-3 bg-dark-plum hover:bg-light-purple text-white px-6 py-3 rounded-lg font-semibold text-base capitalize"
                onClick={openInviteModal}
              >
                <UserPlusIcon className="h-5 w-5" />
                Invite Staff Member
              </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Company Details */}
          {userRole == "startup" && startupInfo && (
            <Card className="mb-8 shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader
                variant="gradient"
                className="bg-gradient-to-r from-dark-plum to-light-purple mb-0 grid mx-0 my-0 py-3 place-items-center"
              >
                <div className="flex items-center justify-between w-full px-4">
                <Typography variant="h4" color="white" className="flex items-center gap-3 font-bold">
                  <BuildingOfficeIcon className="h-6 w-6" />
                  Company Information
                </Typography>
                <div className="flex items-center gap-3">
                  <Button
                      variant="text"
                      className="text-white hover:bg-white/20 p-2"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      <ShieldCheckIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="text"
                      className="text-white hover:bg-white/20 p-2"
                      onClick={openEditProfileModal}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Button>
                </div>
                </div>
              </CardHeader>
              <CardBody className="p-8">
                <div className="flex flex-col gap-4">
                  <div className="space-y-6">
                    <div>
                      <Typography variant="h4" className="mb-4 font-bold text-dark-plum">
                        {startupInfo.company_name}
                      </Typography>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <EnvelopeIcon className="h-6 w-6 text-dark-plum flex-shrink-0" />
                          <div>
                            <Typography variant="small" color="gray" className="font-medium uppercase tracking-wide">
                              Email Address
                            </Typography>
                            <Typography variant="paragraph" className="font-semibold text-gray-900">
                              {startupInfo.user.email}
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
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <MapPinIcon className="h-6 w-6 text-dark-plum flex-shrink-0 mt-1" />
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

          {/* Staff Details Card - Only show when user role is staff */}
          {userRole === 'staff' && startupInfo && (
            <Card className="mb-8 shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader
                variant="gradient"
                className="bg-gradient-to-r from-dark-plum to-light-purple mb-0 grid mx-0 my-0 py-3 place-items-center"
              >
                <div className="flex items-center justify-between w-full px-4">
                  <Typography variant="h4" color="white" className="flex items-center gap-3 font-bold">
                    <UserIcon className="h-6 w-6" />
                    Staff Information
                  </Typography>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="text"
                      className="text-white hover:bg-white/20 p-2"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      <ShieldCheckIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-8">
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
              className="bg-gradient-to-r from-dark-plum to-light-purple mx-0 my-0 grid py-3 place-items-center"
            >
              <Typography variant="h4" color="white" className="flex items-center gap-3 font-bold">
                <UserIcon className="h-6 w-6" />
                Organization Members ({staff.length})
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              {staff.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <Typography variant="h5" color="gray" className="mb-3 font-semibold">
                    No Team Members Yet
                  </Typography>
                  <Typography variant="paragraph" color="gray" className="mb-6 text-lg">
                    Start building your team by inviting staff members to collaborate
                  </Typography>
                  <Button 
                    className="bg-dark-plum hover:bg-light-purple text-white px-8 py-3 rounded-lg font-semibold text-base capitalize flex items-center gap-2"
                    onClick={openInviteModal}
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    Invite Team Member
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        {["Name", "Status", "Actions"].map((el) => (
                          <th
                            key={el}
                            className="border-b border-blue-gray-50 py-4 px-6 text-left"
                          >
                            <Typography
                              variant="small"
                              className="text-md font-bold text-blue-gray-600 tracking-wide"
                            >
                              {el}
                            </Typography>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((member, key) => {
                        const className = `py-4 px-6 ${key === staff.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                        return (
                          <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                            <td className={className}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-dark-plum/10 rounded-full flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-dark-plum" />
                                </div>
                                <div className="flex flex-col">
                                  <Typography variant="small" className="font-semibold text-gray-900">
                                    {member.name}
                                  </Typography>
                                  <Typography variant="small" color="gray" className="text-xs">
                                    ID: {member.id}
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            
                            <td className={className}>
                                {member.status}
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="text"
                                  className="text-dark-plum hover:bg-light-purple/10 p-2"
                                  onClick={() => openViewModal(member)}
                                  title="View"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="text"
                                  className="text-dark-plum hover:bg-light-purple/10 p-2"
                                  onClick={() => openEditModal(member)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="text"
                                  color="red"
                                  className="p-2"
                                  onClick={() => openDeleteModal(member)}
                                  disabled={member.status === 'INACTIVE'}
                                >
                                  <TrashIcon className="h-4 w-4" />
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
          )}
        </div>
      </div>

      {/* Invite Staff Modal */}
      <Dialog open={showInviteModal} handler={() => setShowInviteModal(false)} size="lg" className="rounded-2xl">
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Invite New Team Member
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 bg-beige">
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-sm:grid-cols-1">
            <div className="flex flex-col">
            <Input
              label="Full Name"
              value={formData.name}
                onChange={(e) => handleInviteChange('name', e.target.value)}
                onBlur={() => handleInviteBlur('name')}
                error={!!formTouched.name && !!formErrors.name}
                className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
              {formTouched.name && formErrors.name && (
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
                onBlur={() => handleInviteBlur('position')}
                error={!!formTouched.position && !!formErrors.position}
                className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
              {formTouched.position && formErrors.position && (
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
                onBlur={() => handleInviteBlur('email')}
                error={!!formTouched.email && !!formErrors.email}
                className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
              {formTouched.email && formErrors.email && (
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
                onBlur={() => handleInviteBlur('password')}
                error={!!formTouched.password && !!formErrors.password}
                className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
              {formTouched.password && formErrors.password && (
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
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl">
          <Button 
            variant="text" 
            onClick={() => setShowInviteModal(false)}
            className="mr-3 font-semibold capitalize"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleInviteStaff} 
            disabled={submitting}
            className="bg-dark-plum hover:bg-light-purple text-white font-semibold capitalize px-6"
          >
            {submitting ? <Spinner className="h-5 w-5" /> : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Staff Modal */}
      <Dialog open={showViewModal} handler={() => setShowViewModal(false)} size="lg" className="rounded-2xl">
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Staff Details
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8">
          {selectedStaff && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-sm:grid-cols-1">
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
          <Button 
            onClick={() => setShowViewModal(false)}
            className="bg-dark-plum hover:bg-light-purple text-white font-semibold capitalize px-6"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Staff Modal */}
      <Dialog open={showEditModal} handler={() => setShowEditModal(false)} size="lg" className="rounded-2xl">
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Edit Team Member
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
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
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl">
          <Button 
            variant="text" 
            onClick={() => setShowEditModal(false)}
            className="mr-3 font-semibold capitalize"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStaff} 
            disabled={submitting}
            className="bg-dark-plum hover:bg-light-purple text-white font-semibold capitalize px-6"
          >
            {submitting ? <Spinner className="h-5 w-5" /> : 'Update Member'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Staff Modal */}
      <Dialog open={showDeleteModal} handler={() => setShowDeleteModal(false)} size="md" className="rounded-2xl">
        <DialogHeader className="bg-red-900 text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            Deactivate Team Member
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8">
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
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl">
          <Button 
            variant="text" 
            color="gray" 
            onClick={() => setShowDeleteModal(false)}
            className="mr-3 font-semibold capitalize"
          >
            Cancel
          </Button>
          <Button 
            color="red" 
            onClick={handleDeleteStaff} 
            disabled={submitting}
            className="font-semibold capitalize px-6"
          >
            {submitting ? <Spinner className="h-5 w-5" /> : 'Deactivate'}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showEditProfileModal} handler={() => setShowEditProfileModal(false)} size="lg" className="rounded-2xl">
        <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
          <Typography variant="h4" color="white" className="font-bold">
            {userRole === 'staff' ? 'Change Password' : 'Edit Company Profile'}
          </Typography>
        </DialogHeader>
        <DialogBody className="p-8 bg-beige">
            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-sm:grid-cols-1">
              <div className="flex flex-col">
                <Input
                  label="Full Name"
                  value={profileFormData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  onBlur={() => handleProfileBlur('name')}
                  error={!!profileFormTouched.name && !!profileFormErrors.name}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  size="lg"
                />
                {profileFormTouched.name && profileFormErrors.name && (
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
                  onBlur={() => handleProfileBlur('contact_no')}
                  error={!!profileFormTouched.contact_no && !!profileFormErrors.contact_no}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  size="lg"
                />
                {profileFormTouched.contact_no && profileFormErrors.contact_no && (
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
                  onBlur={() => handleProfileBlur('company_name')}
                  error={!!profileFormTouched.company_name && !!profileFormErrors.company_name}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  size="lg"
                />
                {profileFormTouched.company_name && profileFormErrors.company_name && (
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
                    setProfileFormTouched(prev => ({ ...prev, company_sector: true }));
                  }}
                  error={!!profileFormTouched.company_sector && !!profileFormErrors.company_sector}
                  className="bg-white text-blue-gray300"
                  size="lg"
                >
                  {industryOptions.map((industry) => (
                    <Option key={industry.value} value={industry.value}>
                      {industry.label}
                    </Option>
                  ))}
                </Select>
                {profileFormTouched.company_sector && profileFormErrors.company_sector && (
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
                  onBlur={() => handleProfileBlur('company_address')}
                  error={!!profileFormTouched.company_address && !!profileFormErrors.company_address}
                  className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
                  size="lg"
                />
                {profileFormTouched.company_address && profileFormErrors.company_address && (
                  <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                    {profileFormErrors.company_address}
                  </Typography>
                )}
              </div>
            </div>
        </DialogBody>
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl">
          <Button 
            variant="text" 
            onClick={() => setShowEditProfileModal(false)}
            className="mr-3 font-semibold capitalize"
          >
            Cancel
          </Button>
          <Button 
            onClick={userRole === 'staff' ? submitChangePassword : handleUpdateProfile} 
            disabled={profileSubmitting}
            className="bg-dark-plum hover:bg-light-purple text-white font-semibold capitalize px-6"
          >
            {profileSubmitting ? <Spinner className="h-5 w-5" /> : 'Update Profile'}
          </Button>
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
