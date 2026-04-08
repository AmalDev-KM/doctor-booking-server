import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to the centralized Express error handler.
 *
 * Eliminates try/catch boilerplate in every controller.
 *
 * @param fn - Async Express route handler
 * @returns Wrapped handler that forwards errors to next()
 */
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
