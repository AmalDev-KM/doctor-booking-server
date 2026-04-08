import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import validate from '../middlewares/validate.middleware';
import {
  registerValidator,
  verifyOtpValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator';
import rateLimit from 'express-rate-limit';

const router = Router();

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Limit auth endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Max 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // Stricter limit for login attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (sends OTP to email)
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(registerValidator),
  authController.register
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify email using OTP
 * @access  Public
 */
router.post(
  '/verify-otp',
  authLimiter,
  validate(verifyOtpValidator),
  authController.verifyOtp
);

/**
 * @route   POST /api/auth/login
 * @desc    Admin login (returns JWT)
 * @access  Public (Admin only)
 */
router.post(
  '/login',
  loginLimiter,
  validate(loginValidator),
  authController.login
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordValidator),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordValidator),
  authController.resetPassword
);

export default router;
