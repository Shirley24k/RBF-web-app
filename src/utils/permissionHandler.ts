/**
 * Utility function to handle staff permission errors consistently
 * @param error - The error object from axios
 * @param defaultMessage - Default error message if none is provided
 * @param action - The action that was being performed (e.g., "view proposals", "create application")
 */
export const handleStaffPermissionError = (
  error: any, 
  defaultMessage: string,
  action: string
): boolean => {
  // Check if it's a 403 permission error
  if (error.response?.status === 403) {
    const errorMessage = error.response.data?.error || defaultMessage;
    
    // Show specific alert for staff permission issues
    alert(`Permission Error: ${errorMessage}\n\nAction: ${action}\n\nYou will be redirected to the login page.`);
    
    // Clear storage and redirect to login
    localStorage.clear();
    window.location.href = "/login";
    return true; // Error was handled
  }
  
  return false; // Error was not handled
};

/**
 * Check if the current user is a staff member
 */
export const isStaffMember = (): boolean => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'staff';
};

/**
 * Check if the current user is a startup owner
 */
export const isStartupOwner = (): boolean => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'startup';
};

/**
 * Get the effective role for navigation (staff members use startup routes)
 */
export const getEffectiveRole = (): string => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'staff' ? 'startup' : user.role;
};
