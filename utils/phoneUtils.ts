
/**
 * Utility functions for handling phone numbers and WhatsApp integration,
 * specifically optimized for Virtual SIMs (VoIP) which often use international
 * formats (e.g., US +1, UK +44) even for users in other regions.
 */

/**
 * Normalizes a phone number to E.164 format (digits only, including country code)
 */
export const normalizePhone = (phone: string): string => {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If it starts with 0 and is likely a local Nigerian number, convert to international
  if (digits.startsWith('0') && digits.length === 11) {
    digits = '234' + digits.substring(1);
  }
  
  return digits;
};

/**
 * Heuristic algorithm to detect if a number is likely a Virtual SIM/VoIP number
 * common for international app usage. Often these are US (+1) or UK (+44) numbers.
 */
export const isLikelyVirtualSim = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  // Common prefixes for virtual SIM providers (US, UK, Canada, etc.)
  const virtualCountryCodes = ['1', '44', '372', '48']; // US/CA, UK, Estonia, Poland (common virtual sim hubs)
  
  return virtualCountryCodes.some(code => normalized.startsWith(code) && normalized.length > code.length);
};

/**
 * Generates a standard WhatsApp wa.me link
 */
export const generateWhatsAppLink = (adminPhone: string, message: string): string => {
  const target = normalizePhone(adminPhone);
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
};

/**
 * Formats a phone number for display with a + prefix
 */
export const displayPhone = (phone: string): string => {
  const normalized = normalizePhone(phone);
  return `+${normalized}`;
};
