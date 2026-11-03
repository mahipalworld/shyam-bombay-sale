/**
 * Official WhatsApp Business Account & Store Contact Phone Constants
 * Shyam Bombay Sale (SBS) - Subhanpura, Vadodara, Gujarat
 */

export const OFFICIAL_WABA_PHONE = '+91 98298 77766';
export const OFFICIAL_WABA_PHONE_DIGITS = '9829877766';

/**
 * Deprecated legacy phone numbers (e.g., initial test mocks or legacy numbers)
 * that must be redirected to the official WABA phone number.
 */
export const DEPRECATED_LEGACY_PHONES = [
  '9988776655', // Placeholder test phone
  '9226294797', // Legacy individual phone number
];

/**
 * Validates whether a given phone string matches a deprecated legacy number.
 */
export function isDeprecatedStorePhone(phone?: string | null): boolean {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, '');
  return DEPRECATED_LEGACY_PHONES.some(legacy => digits.includes(legacy));
}

/**
 * Normalizes any store contact phone to the official WABA phone if missing or deprecated.
 */
export function getSanitizedStorePhone(phone?: string | null): string {
  if (!phone || isDeprecatedStorePhone(phone)) {
    return OFFICIAL_WABA_PHONE;
  }
  return phone;
}
