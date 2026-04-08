import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HttpStatus, Messages } from '../constants';

/**
 * Generic validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerValidator), authController.register);
 *
 * @param schema - Joi schema to validate against req.body
 * @returns Express middleware that validates the request body
 */
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // Collect ALL errors, not just the first
      stripUnknown: true,  // Remove fields not in the schema
      convert: true,       // Auto-convert types (e.g. lowercase email)
    });

    if (error) {
      // Format all Joi error details into a clean array
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''), // Remove surrounding quotes from messages
      }));

      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: Messages.VALIDATION_ERROR,
        errors,
      });
      return;
    }

    // Assign validated (and stripped) data back to req.body
    req.body = value;
    next();
  };
};

export default validate;
