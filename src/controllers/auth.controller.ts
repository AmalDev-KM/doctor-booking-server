import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/responseHandler';
import { HttpStatus, Messages } from '../constants';
import asyncHandler from '../utils/asyncHandler';

/**
 * Auth Controller
 *
 * Responsibilities:
 *  - Parse request body
 *  - Call appropriate service method
 *  - Send structured response
 *
 * NO business logic here — all logic lives in auth.service.ts
 */

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  await authService.registerUser(req.body);
  sendSuccess(res, Messages.REGISTER_SUCCESS, null, HttpStatus.CREATED);
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyOTP(req.body);
  sendSuccess(res, Messages.OTP_VERIFIED);
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginAdmin(req.body);
  sendSuccess(res, Messages.LOGIN_SUCCESS, result);
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  // Always return success to prevent user enumeration
  sendSuccess(res, Messages.FORGOT_PASSWORD_SUCCESS);
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, Messages.RESET_PASSWORD_SUCCESS);
});
