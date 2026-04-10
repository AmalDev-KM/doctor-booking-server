import { Router } from 'express';
import * as doctorProfileController from '../controllers/doctorProfile.controller';
import validate from '../middlewares/validate.middleware';
import {
  basicInfoValidator,
  professionalInfoValidator,
  qualificationValidator,
  clinicValidator,
  verifyProfileValidator,
} from '../validators/doctorProfile.validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../constants';

const router = Router();

// Protect ALL routes
router.use(authenticate);

// ─── DOCTOR ROUTES ───────────────────────────────────────────────────────
// Only doctors can manage their own profiles
const requireDoctor = authorize(UserRole.DOCTOR);

router.post('/init', requireDoctor, doctorProfileController.initProfile);

router.put('/basic-info', requireDoctor, validate(basicInfoValidator), doctorProfileController.updateBasicInfo);

router.put('/professional-info', requireDoctor, validate(professionalInfoValidator), doctorProfileController.updateProfessionalInfo);

// Qualifications
router.post('/qualifications', requireDoctor, validate(qualificationValidator), doctorProfileController.addQualification);
router.put('/qualifications/:index', requireDoctor, validate(qualificationValidator), doctorProfileController.updateQualification);
router.delete('/qualifications/:index', requireDoctor, doctorProfileController.removeQualification);

// Clinics
router.post('/clinics', requireDoctor, validate(clinicValidator), doctorProfileController.addClinic);
router.put('/clinics/:index', requireDoctor, validate(clinicValidator), doctorProfileController.updateClinic);
router.delete('/clinics/:index', requireDoctor, doctorProfileController.removeClinic);

// GET / DELETE My Profile
router.get('/me', requireDoctor, doctorProfileController.getMyProfile);
router.delete('/', requireDoctor, doctorProfileController.deleteMyProfile);

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────
// Only admins can verify profiles
router.patch(
  '/verify/:id',
  authorize(UserRole.ADMIN),
  validate(verifyProfileValidator),
  doctorProfileController.verifyProfile
);

export default router;
