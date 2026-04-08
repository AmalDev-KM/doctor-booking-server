import Joi from 'joi';
import { UserRole } from '../constants';

// ─── Password Rule (reusable) ─────────────────────────────────────────────────
const passwordRule = Joi.string()
  .min(8)
  .max(64)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.max': 'Password must not exceed 64 characters.',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    'any.required': 'Password is required.',
  });

// ─── Register Validator ───────────────────────────────────────────────────────
export const registerValidator = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters.',
    'string.max': 'Name must not exceed 100 characters.',
  }),

  email: Joi.string().trim().email({ tlds: { allow: false } }).lowercase().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),

  password: passwordRule,

  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      'any.only': `Role must be one of: ${Object.values(UserRole).join(', ')}.`,
      'any.required': 'Role is required.',
    }),
});

// ─── Verify OTP Validator ─────────────────────────────────────────────────────
export const verifyOtpValidator = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).lowercase().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits.',
      'string.pattern.base': 'OTP must contain only numbers.',
      'any.required': 'OTP is required.',
    }),
});

// ─── Login Validator ──────────────────────────────────────────────────────────
export const loginValidator = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).lowercase().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required.',
  }),
});

// ─── Forgot Password Validator ────────────────────────────────────────────────
export const forgotPasswordValidator = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).lowercase().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
});

// ─── Reset Password Validator ─────────────────────────────────────────────────
export const resetPasswordValidator = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required.',
  }),

  newPassword: passwordRule,

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match.',
      'any.required': 'Please confirm your new password.',
    }),
});
