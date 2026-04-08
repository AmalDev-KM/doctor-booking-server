import User, { IUser } from '../models/user.model';
import AppError from '../utils/AppError';
import { signToken } from '../helpers/jwt.helper';
import { sendOTPEmail, sendResetPasswordEmail } from '../helpers/email.helper';
import {
  generateOTP,
  getOTPExpiry,
  generateResetToken,
  hashToken,
  getResetTokenExpiry,
} from '../helpers/utils.helper';
import { HttpStatus, Messages, TokenConfig, UserRole, UserStatus } from '../constants';
import logger from '../utils/logger';

// ─── Register User ────────────────────────────────────────────────────────────

interface RegisterPayload {
  name?: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Register a new user:
 * 1. Check for duplicate email
 * 2. Create user (password hashed via pre-save hook)
 * 3. Generate OTP + expiry
 * 4. Send OTP email
 */
export const registerUser = async (payload: RegisterPayload): Promise<void> => {
  const { name, email, password, role } = payload;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(Messages.USER_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = getOTPExpiry(TokenConfig.OTP_EXPIRY_MINUTES);

  // Create user (password gets hashed by pre-save hook)
  await User.create({
    name,
    email,
    password,
    role,
    otp,
    otpExpiry,
    isVerified: false,
    status: UserStatus.ACTIVE,
  });

  // Send OTP email
  await sendOTPEmail(email, otp);
  logger.info(`User registered: ${email}`);
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

interface VerifyOTPPayload {
  email: string;
  otp: string;
}

/**
 * Verify a user's email via OTP:
 * 1. Find user with OTP fields
 * 2. Check OTP match and expiry
 * 3. Mark as verified, clear OTP fields
 */
export const verifyOTP = async (payload: VerifyOTPPayload): Promise<void> => {
  const { email, otp } = payload;

  // Fetch user including hidden OTP fields
  const user = await User.findOne({ email }).select('+otp +otpExpiry');
  if (!user) {
    throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified.', HttpStatus.BAD_REQUEST);
  }

  if (!user.otp || !user.otpExpiry) {
    throw new AppError(Messages.OTP_INVALID, HttpStatus.BAD_REQUEST);
  }

  // Check OTP expiry
  if (new Date() > user.otpExpiry) {
    throw new AppError(Messages.OTP_EXPIRED, HttpStatus.BAD_REQUEST);
  }

  // Check OTP match
  if (user.otp !== otp) {
    throw new AppError(Messages.OTP_INVALID, HttpStatus.BAD_REQUEST);
  }

  // Mark as verified and clear OTP fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  logger.info(`Email verified for user: ${email}`);
};

// ─── Login (Admin only) ───────────────────────────────────────────────────────

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: Pick<IUser, 'name' | 'email' | 'role' | 'status'>;
}

/**
 * Authenticate an Admin user:
 * 1. Find user by email (include password)
 * 2. Check role is ADMIN
 * 3. Verify password with bcrypt
 * 4. Check isVerified + status
 * 5. Generate and return JWT
 */
export const loginAdmin = async (payload: LoginPayload): Promise<LoginResult> => {
  const { email, password } = payload;

  // Explicitly fetch password (it's select: false in schema)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError(Messages.LOGIN_FAILED, HttpStatus.UNAUTHORIZED);
  }

  // Restrict login to ADMIN role only (Phase 1)
  if (user.role !== UserRole.ADMIN) {
    throw new AppError(Messages.FORBIDDEN, HttpStatus.FORBIDDEN);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError(Messages.LOGIN_FAILED, HttpStatus.UNAUTHORIZED);
  }

  // Ensure email is verified
  if (!user.isVerified) {
    throw new AppError(Messages.NOT_VERIFIED, HttpStatus.FORBIDDEN);
  }

  // Ensure account is active
  if (user.status === UserStatus.INACTIVE) {
    throw new AppError(Messages.ACCOUNT_INACTIVE, HttpStatus.FORBIDDEN);
  }

  // Generate JWT
  const token = signToken({
    userId: (user._id as unknown as string).toString(),
    email: user.email,
    role: user.role,
  });

  logger.info(`Admin logged in: ${email}`);

  return {
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Initiate password reset:
 * 1. Find user by email
 * 2. Generate plain reset token + hashed version
 * 3. Store hashed token + expiry in DB
 * 4. Send reset email with plain token in URL
 *
 * Note: We store the HASHED token in DB and send the PLAIN token in the email.
 * On reset, we hash the incoming token and compare with DB.
 */
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    // Security: Do not reveal whether email exists or not
    logger.warn(`Forgot password requested for non-existent email: ${email}`);
    return; // Silently succeed to prevent user enumeration
  }

  // Generate token pair
  const plainToken = generateResetToken();
  const hashedToken = hashToken(plainToken);
  const tokenExpiry = getResetTokenExpiry(TokenConfig.RESET_TOKEN_EXPIRY_MINUTES);

  // Save hashed token to DB
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Send plain token in email link
  await sendResetPasswordEmail(email, plainToken);
  logger.info(`Password reset email sent to: ${email}`);
};

// ─── Reset Password ───────────────────────────────────────────────────────────

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

/**
 * Complete password reset:
 * 1. Hash the incoming token
 * 2. Find user with matching hashed token that hasn't expired
 * 3. Update password (pre-save hook hashes it)
 * 4. Clear reset token fields
 */
export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  const { token, newPassword } = payload;

  // Hash the incoming token to compare with stored hash
  const hashedToken = hashToken(token);

  // Find user with valid, non-expired token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: new Date() }, // Token not yet expired
  }).select('+resetPasswordToken +resetPasswordExpiry');

  if (!user) {
    throw new AppError(Messages.RESET_TOKEN_INVALID, HttpStatus.BAD_REQUEST);
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  logger.info(`Password reset successful for user: ${user.email}`);
};
