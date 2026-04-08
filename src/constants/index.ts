/**
 * Application-wide constants, enums, and messages
 */

// ─── User Roles ───────────────────────────────────────────────────────────────
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

// ─── User Status ──────────────────────────────────────────────────────────────
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// ─── HTTP Status Codes ────────────────────────────────────────────────────────
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// ─── Response Messages ────────────────────────────────────────────────────────
export const Messages = {
  // Auth
  REGISTER_SUCCESS: 'Registration successful. Please verify your email with the OTP sent.',
  OTP_SENT: 'OTP sent to your email address.',
  OTP_VERIFIED: 'Email verified successfully.',
  OTP_INVALID: 'Invalid OTP provided.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  LOGIN_SUCCESS: 'Login successful.',
  LOGIN_FAILED: 'Invalid email or password.',
  NOT_VERIFIED: 'Email not verified. Please verify your OTP first.',
  FORGOT_PASSWORD_SUCCESS: 'Password reset link sent to your email.',
  RESET_PASSWORD_SUCCESS: 'Password has been reset successfully.',
  RESET_TOKEN_INVALID: 'Invalid or expired reset token.',
  ACCOUNT_INACTIVE: 'Your account has been deactivated. Please contact support.',

  // User
  USER_NOT_FOUND: 'User not found.',
  USER_ALREADY_EXISTS: 'A user with this email already exists.',

  // Department
  DEPARTMENT_CREATED: 'Department created successfully.',
  DEPARTMENT_UPDATED: 'Department updated successfully.',
  DEPARTMENT_DELETED: 'Department deleted successfully.',
  DEPARTMENT_NOT_FOUND: 'Department not found.',
  DEPARTMENT_ALREADY_EXISTS: 'A department with this name already exists.',

  // General
  INTERNAL_ERROR: 'An internal server error occurred.',
  VALIDATION_ERROR: 'Validation failed.',
  UNAUTHORIZED: 'Unauthorized. Please login to continue.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
} as const;

// ─── Token Config ─────────────────────────────────────────────────────────────
export const TokenConfig = {
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
  RESET_TOKEN_EXPIRY_MINUTES: parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || '60', 10),
} as const;
