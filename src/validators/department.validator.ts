import Joi from 'joi';

// ─── Create Department Validator ──────────────────────────────────────────────
export const createDepartmentValidator = Joi.object({
  departmentName: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Department name must be at least 2 characters.',
    'string.max': 'Department name must not exceed 100 characters.',
    'any.required': 'Department name is required.',
  }),
  departmentDescription: Joi.string().trim().min(5).max(1000).required().messages({
    'string.min': 'Description must be at least 5 characters.',
    'string.max': 'Description must not exceed 1000 characters.',
    'any.required': 'Department description is required.',
  }),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional().messages({
    'any.only': 'Status must be ACTIVE or INACTIVE.',
  }),
});

// ─── Update Department Validator ──────────────────────────────────────────────
export const updateDepartmentValidator = Joi.object({
  departmentName: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Department name must be at least 2 characters.',
    'string.max': 'Department name must not exceed 100 characters.',
  }),
  departmentDescription: Joi.string().trim().min(5).max(1000).optional().messages({
    'string.min': 'Description must be at least 5 characters.',
    'string.max': 'Description must not exceed 1000 characters.',
  }),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional().messages({
    'any.only': 'Status must be ACTIVE or INACTIVE.',
  }),
}).min(1).messages({
  'object.min': 'At least one field is required to update.',
});
