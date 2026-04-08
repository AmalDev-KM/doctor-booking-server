import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import AppError from '../utils/AppError';
import { HttpStatus } from '../constants';

/**
 * Create reusable Nodemailer transporter from environment variables
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an OTP verification email to the user
 *
 * @param email - Recipient email address
 * @param otp - 6-digit OTP string
 */
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const transporter = createTransporter();
  const otpExpiryMinutes = process.env.OTP_EXPIRY_MINUTES || '10';

  const mailOptions = {
    from: `"DocBook" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: '🔐 Verify Your Email - DocBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 16px;">Email Verification</h2>
        <p style="color: #374151; font-size: 16px;">Thank you for registering with <strong>DocBook</strong>!</p>
        <p style="color: #374151; font-size: 16px;">Use the OTP below to verify your email address:</p>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">⏱ This OTP will expire in <strong>${otpExpiryMinutes} minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} DocBook. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}: ${(error as Error).message}`);
    throw new AppError('Failed to send verification email. Please try again.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Send a password reset email with a reset link
 *
 * @param email - Recipient email address
 * @param resetToken - Plain reset token (to be embedded in the URL)
 */
export const sendResetPasswordEmail = async (email: string, resetToken: string): Promise<void> => {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const expiryMinutes = process.env.RESET_TOKEN_EXPIRY_MINUTES || '60';

  const mailOptions = {
    from: `"DocBook" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: '🔑 Password Reset Request - DocBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 16px;">Password Reset Request</h2>
        <p style="color: #374151; font-size: 16px;">We received a request to reset the password for your <strong>DocBook</strong> account.</p>
        <p style="color: #374151; font-size: 16px;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #374151; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #6b7280; font-size: 14px;">⏱ This link will expire in <strong>${expiryMinutes} minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} DocBook. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send reset email to ${email}: ${(error as Error).message}`);
    throw new AppError('Failed to send password reset email. Please try again.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
