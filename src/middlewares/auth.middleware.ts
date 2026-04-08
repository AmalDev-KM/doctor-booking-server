import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../helpers/jwt.helper';
import { HttpStatus, Messages, UserRole } from '../constants';
import User from '../models/user.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Authentication middleware.
 * Verifies the JWT from Authorization header and attaches the user to req.user.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded: TokenPayload = verifyToken(token);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('status role email');
    if (!user) {
      throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
    }

    if (user.status === 'INACTIVE') {
      throw new AppError(Messages.ACCOUNT_INACTIVE, HttpStatus.FORBIDDEN);
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as UserRole,
    };

    next();
  }
);

/**
 * Authorization middleware factory.
 * Restricts access to users with specific roles.
 *
 * Usage:
 *   router.get('/admin-only', authenticate, authorize(UserRole.ADMIN), handler)
 *
 * @param roles - Allowed roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(Messages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    next();
  };
};
