import Joi from 'joi';

// ─── Basic Info Validator ──────────────────────────────────────────────────
export const basicInfoValidator = Joi.object({
  firstName: Joi.string().trim().required().messages({
    'any.required': 'First name is required.',
  }),
  lastName: Joi.string().trim().required().messages({
    'any.required': 'Last name is required.',
  }),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  dateOfBirth: Joi.date().iso().optional(),
  profileImageUrl: Joi.string().uri().optional(),
  profileImagePublicId: Joi.string().optional(),
  phoneNumber: Joi.string().trim().required().messages({
    'any.required': 'Phone number is required.',
  }),
  alternatePhoneNumber: Joi.string().trim().optional(),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required.',
    'string.email': 'Valid email is required.',
  }),
  bloodGroup: Joi.string().trim().optional(),
  languagesSpoken: Joi.array().items(Joi.string().trim()).optional(),
  nationality: Joi.string().trim().optional(),
});

// ─── Professional Info Validator ───────────────────────────────────────────
export const professionalInfoValidator = Joi.object({
  specialization: Joi.string().trim().optional(),
  superSpecialization: Joi.string().trim().optional(),
  totalExperience: Joi.number().min(0).optional().messages({
    'number.min': 'Total experience cannot be negative.',
  }),
  medicalRegistrationNumber: Joi.string().trim().optional(),
  medicalCouncil: Joi.string().trim().optional(),
  consultationFee: Joi.number().min(0).optional().messages({
    'number.min': 'Consultation fee cannot be negative.',
  }),
  emergencyFee: Joi.number().min(0).optional().messages({
    'number.min': 'Emergency fee cannot be negative.',
  }),
  aboutDoctor: Joi.string().trim().optional(),
  servicesOffered: Joi.array().items(Joi.string().trim()).optional(),
  awards: Joi.array().items(Joi.string().trim()).optional(),
  memberships: Joi.array().items(Joi.string().trim()).optional(),
});

// ─── Qualification Validator ───────────────────────────────────────────────
export const qualificationValidator = Joi.object({
  degree: Joi.string().trim().required().messages({
    'any.required': 'Degree is required.',
  }),
  fieldOfStudy: Joi.string().trim().optional(),
  university: Joi.string().trim().required().messages({
    'any.required': 'University is required.',
  }),
  collegeName: Joi.string().trim().optional(),
  yearOfCompletion: Joi.number()
    .integer()
    .min(1950)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      'number.max': 'Year of completion cannot be in the future.',
    }),
  country: Joi.string().trim().optional(),
});

// ─── Clinic Validator ──────────────────────────────────────────────────────
export const clinicValidator = Joi.object({
  clinicName: Joi.string().trim().required().messages({
    'any.required': 'Clinic name is required.',
  }),
  addressLine1: Joi.string().trim().required().messages({
    'any.required': 'Address Line 1 is required.',
  }),
  addressLine2: Joi.string().trim().optional(),
  city: Joi.string().trim().required().messages({
    'any.required': 'City is required.',
  }),
  state: Joi.string().trim().required().messages({
    'any.required': 'State is required.',
  }),
  country: Joi.string().trim().required().messages({
    'any.required': 'Country is required.',
  }),
  pincode: Joi.string().trim().optional(),
  landmark: Joi.string().trim().optional(),
  contactNumber: Joi.string().trim().optional(),
  facilities: Joi.array().items(Joi.string().trim()).optional(),
  consultationMode: Joi.string().valid('Offline', 'Online', 'Both').optional(),
});

// ─── Admin Verify Validator ────────────────────────────────────────────────
export const verifyProfileValidator = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required().messages({
    'any.only': 'Verify status must be pending, approved or rejected.',
    'any.required': 'Status is required.',
  }),
});
