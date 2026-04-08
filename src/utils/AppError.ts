/**
 * Custom Application Error class.
 * Extend the built-in Error to carry HTTP status codes,
 * allowing the global error handler to respond correctly.
 */
class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes known errors from programmer bugs

    // Maintain proper stack trace (V8 only)
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;
