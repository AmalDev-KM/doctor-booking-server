import crypto from 'crypto';

/**
 * Generate a 6-digit numeric OTP
 * @returns 6-digit OTP as a string (zero-padded)
 */
export const generateOTP = (): string => {
  // Generate a cryptographically secure random number between 100000 and 999999
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
};

/**
 * Calculate OTP expiry timestamp
 * @param minutes - Number of minutes until expiry (default: 10)
 * @returns Date object representing the expiry time
 */
export const getOTPExpiry = (minutes: number = 10): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

/**
 * Generate a secure random token for password reset
 * @returns Hex string token
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token using SHA-256 (for storing reset tokens securely in DB)
 * @param token - Plain reset token
 * @returns Hashed token
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Calculate reset token expiry timestamp
 * @param minutes - Number of minutes until expiry (default: 60)
 * @returns Date object representing the expiry time
 */
export const getResetTokenExpiry = (minutes: number = 60): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};
