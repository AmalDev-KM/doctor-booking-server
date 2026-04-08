import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import AppError from '../utils/AppError';
import { HttpStatus } from '../constants';

/**
 * JWT payload structure
 */
export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

/**
 * Sign a JWT token with the given payload.
 *
 * @param payload - Data to encode in the token
 * @param expiresIn - Token expiry (default: env JWT_EXPIRES_IN)
 * @returns Signed JWT string
 */
export const signToken = (
  payload: TokenPayload,
  expiresIn: string = process.env.JWT_EXPIRES_IN || '7d'
): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET is not configured.', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
};

/**
 * Verify and decode a JWT token.
 *
 * @param token - JWT string to verify
 * @returns Decoded payload
 * @throws AppError if token is invalid or expired
 */
export const verifyToken = (token: string): TokenPayload & JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET is not configured.', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  try {
    return jwt.verify(token, secret) as TokenPayload & JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token has expired. Please login again.', HttpStatus.UNAUTHORIZED);
    }
    throw new AppError('Invalid token. Please login again.', HttpStatus.UNAUTHORIZED);
  }
};
