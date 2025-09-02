import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  onSuccess?: () => void;
}

export const ChangePasswordModal = ({ open, onClose, title = 'Change Password', onSuccess }: ChangePasswordModalProps): JSX.Element => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [touched, setTouched] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name: keyof typeof touched, value: string): string | undefined => {
    switch (name) {
      case 'current_password':
        return !value.trim() ? 'Current password is required' : undefined;
      case 'new_password':
        if (!value.trim()) return 'New password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      case 'confirm_password':
        if (!value.trim()) return 'Confirm password is required';
        if (value !== form.new_password) return 'Passwords do not match';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    const err = validateField(field as keyof typeof touched, value);
    setErrors(prev => ({ ...prev, [field]: err || '' }));
    if (!err) {
      setErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = String((form as any)[field] ?? '');
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err || '' }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    (['current_password', 'new_password', 'confirm_password'] as Array<keyof typeof touched>).forEach((k) => {
      const v = String((form as any)[k] ?? '');
      const e = validateField(k, v);
      if (e) newErrors[k] = e;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ current_password: true, new_password: true, confirm_password: true });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/change-password`, form, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data?.success) {
        alert('Password changed successfully');
        setForm({ current_password: '', new_password: '', confirm_password: '' });
        setErrors({});
        setTouched({ current_password: false, new_password: false, confirm_password: false });
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors) {
        const mapped: Record<string, string> = {};
        Object.keys(apiErrors).forEach((k) => {
          mapped[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : String(apiErrors[k]);
        });
        setErrors(mapped);
        setTouched({ current_password: true, new_password: true, confirm_password: true });
      } else {
        alert('Failed to change password: ' + (error?.response?.data?.error || error?.message || 'Unknown error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="lg" className="rounded-2xl">
      <DialogHeader className="bg-gradient-to-r from-dark-plum to-light-purple text-white rounded-t-2xl">
        <Typography variant="h4" color="white" className="font-bold">
          {title}
        </Typography>
      </DialogHeader>
      <DialogBody className="p-8 bg-beige">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col">
            <Input
              label="Current Password"
              type="password"
              value={form.current_password}
              onChange={(e) => handleChange('current_password', e.target.value)}
              onBlur={() => handleBlur('current_password')}
              error={!!touched.current_password && !!errors.current_password}
              className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
            {touched.current_password && errors.current_password && (
              <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                {errors.current_password}
              </Typography>
            )}
          </div>

          <div className="flex flex-col">
            <Input
              label="New Password"
              type="password"
              value={form.new_password}
              onChange={(e) => handleChange('new_password', e.target.value)}
              onBlur={() => handleBlur('new_password')}
              error={!!touched.new_password && !!errors.new_password}
              className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
            {touched.new_password && errors.new_password && (
              <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                {errors.new_password}
              </Typography>
            )}
          </div>

          <div className="flex flex-col">
            <Input
              label="Confirm New Password"
              type="password"
              value={form.confirm_password}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              onBlur={() => handleBlur('confirm_password')}
              error={!!touched.confirm_password && !!errors.confirm_password}
              className="h-10 px-3 py-3 bg-white border-blue-gray100 text-blue-gray300 font-leading-tight-text-sm-font-normal"
              size="lg"
            />
            {touched.confirm_password && errors.confirm_password && (
              <Typography variant="small" color="red" className="mt-1 font-text-sm-font-normal">
                {errors.confirm_password}
              </Typography>
            )}
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl">
        <Button 
          variant="text" 
          onClick={onClose}
          className="mr-3 font-semibold capitalize"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="bg-dark-plum hover:bg-light-purple text-white font-semibold capitalize px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner className="h-5 w-5" />
            </div>
          ) : (
            'Update Password'
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};


