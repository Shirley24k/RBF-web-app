import axios from "axios";

axios.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const requestUrl: string | undefined = error?.config?.url;

    // Do not redirect for login-specific 403 (unverified email)
    const isLoginRequest = requestUrl?.endsWith('/login');
    const isVerificationRequired = data && data.email_verification_required === true;

    if (status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return; // stop further processing
    }

    if (status === 403) {
      // Skip redirect if it's the login call with unverified email signal
      if (isLoginRequest || isVerificationRequired) {
        return Promise.reject(error);
      }
      
      // Check if it's a staff permission error
      const errorMessage = data?.error || 'Access denied';
      
      if (errorMessage.includes('Staff member not found or inactive') ||
          errorMessage.includes('This action is restricted to startup owners only') ||
          errorMessage.includes('Insufficient permissions to perform this action') ||
          errorMessage.includes('Only startup owners can')) {
        
        // Show specific alert for staff permission issues
        alert(`Permission Error: ${errorMessage}\n\nYou will be redirected to the login page.`);
      } else {
        // For other 403 errors, show generic message
        alert(`Access Denied: ${errorMessage}\n\nYou will be redirected to the login page.`);
      }
      
      // Clear storage and redirect to login
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    return Promise.reject(error);
  }
);

export default axios;    