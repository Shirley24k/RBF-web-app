import { type ClassValue, clsx } from "clsx";
import { CountryCode } from "libphonenumber-js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates phone numbers including Malaysian mobile and home phone numbers
 * @param phone - The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export const isValidPhoneNumber = (phone: string, country?: CountryCode | string): boolean => {
  if (!phone) return false;
  
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If country is Malaysia, validate Malaysian phone numbers strictly
  if (country === 'MY' || country === 'Malaysia' || !country) {
    // Remove Malaysia country code (60) if present at the beginning
    let phoneWithoutCountryCode = cleanPhone;
    if (cleanPhone.startsWith('60')) {
      phoneWithoutCountryCode = cleanPhone.substring(1);
    }
    
    // Malaysian mobile number validation (10-11 digits, starting with 01)
    if (phoneWithoutCountryCode.startsWith('01') && (phoneWithoutCountryCode.length === 10 || phoneWithoutCountryCode.length === 11)) {
      return true;
    }
    
    // Malaysian home phone number validation (8-10 digits, starting with 03, 04, 05, 06, 07, 08, 09)
    if ((phoneWithoutCountryCode.startsWith('03') || phoneWithoutCountryCode.startsWith('04') || phoneWithoutCountryCode.startsWith('05') || 
         phoneWithoutCountryCode.startsWith('06') || phoneWithoutCountryCode.startsWith('07') || phoneWithoutCountryCode.startsWith('08') || 
         phoneWithoutCountryCode.startsWith('09')) && (phoneWithoutCountryCode.length >= 8 && phoneWithoutCountryCode.length <= 10)) {
      return true;
    }
    
    // For Malaysia, don't fall through to international validation
    return false;
  }
  
  // For non-Malaysian countries, use international validation
  // International phone number validation (7-15 digits)
  if (cleanPhone.length >= 7 && cleanPhone.length <= 15) {
    return true;
  }
  
  return false;
};

/**
 * Validates password strength and length
 * @param password - The password to validate
 * @returns boolean indicating if the password is valid
 */
export const isValidPassword = (password: string): boolean => {
  if (!password) return false;
  
  // Password must be at least 8 characters long
  if (password.length < 8) return false;
  
  return true;
};
