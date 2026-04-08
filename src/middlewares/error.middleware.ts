import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import logger from '../utils/logger';
import { HttpStatus } from '../constants';

/**
 * Centralized Error Handling Middleware.
 *
 * Must be registered as the LAST middleware in app.ts.
 * Handles AppError (operational) and unexpected errors gracefully.
 */
const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // ─── Operational Errors (known, expected) ────────────────────────────────
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // ─── Mongoose Validation Error ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed.',
      errors: err.message,
    });
    return;
  }

  // ─── Mongoose Duplicate Key Error ─────────────────────────────────────────
  if ((err as NodeJS.ErrnoException).code === '11000') {
    res.status(HttpStatus.CONFLICT).json({
      success: false,
      message: 'A record with this value already exists.',
    });
    return;
  }

  // ─── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Token has expired. Please login again.',
    });
    return;
  }

  // ─── Unknown / Programmer Errors ──────────────────────────────────────────
  logger.error(`[UnhandledError]: ${err.message}`, { stack: err.stack });

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred.'
        : err.message,
  });
};

export default errorHandler;
