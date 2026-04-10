import { DoctorProfile, IDoctorProfile } from '../models/doctorProfile.model';
import User from '../models/user.model';
import AppError from '../utils/AppError';
import { HttpStatus } from '../constants';

// Helper: Check profile completion parts
const isBasicInfoCompleted = (profile: any) => {
  return !!(
    profile.basicInfo?.firstName &&
    profile.basicInfo?.lastName &&
    profile.basicInfo?.phoneNumber &&
    profile.basicInfo?.email
  );
};

const isProfessionalInfoCompleted = (profile: any) => {
  return !!profile.professionalInfo && Object.keys(profile.professionalInfo).length > 0;
};

const isQualificationsCompleted = (profile: any) => {
  return profile.qualifications && profile.qualifications.length > 0;
};

const isClinicsCompleted = (profile: any) => {
  return profile.clinics && profile.clinics.length > 0;
};

// Helper: Wrap profile and attach dynamic completed step
const returnProfileWithStep = (profile: any) => {
  let completedStep = 0;
  if (isBasicInfoCompleted(profile)) completedStep = 1;
  if (completedStep === 1 && isProfessionalInfoCompleted(profile)) completedStep = 2;
  if (completedStep === 2 && isQualificationsCompleted(profile)) completedStep = 3;
  if (completedStep === 3 && isClinicsCompleted(profile)) completedStep = 4;

  const profileData = profile.toObject ? profile.toObject() : { ...profile };
  profileData.completedStep = completedStep;
  return profileData;
};

// Helper: Check profile completion
const checkAndUpdateProfileCompletion = async (profileId: string) => {
  const profile = await DoctorProfile.findById(profileId);
  if (!profile) return;

  const hasBasicInfo = isBasicInfoCompleted(profile);
  const hasProfessionalInfo = isProfessionalInfoCompleted(profile);
  const hasQualifications = isQualificationsCompleted(profile);
  const hasClinics = isClinicsCompleted(profile);

  const isCompleted = Boolean(hasBasicInfo && hasProfessionalInfo && hasQualifications && hasClinics);

  if (profile.isProfileCompleted !== isCompleted) {
    profile.isProfileCompleted = isCompleted;
    await profile.save();
  }
};

// Helper: check if locked
const enforceEditLock = (profile: any) => {
  if (profile.verificationStatus === 'approved') {
    throw new AppError('Profile is approved. You cannot edit or delete this section.', HttpStatus.FORBIDDEN);
  }
};

// Helper: automatically revert review status when doctor makes changes
const resetVerificationStatusIfChanged = (profile: any) => {
  if (profile.verificationStatus === 'change_requested' || profile.verificationStatus === 'rejected') {
    // Setting back to pending ensures the admin can review the newly updated profile organically
    profile.verificationStatus = 'pending';
  }
};

// ─── INIT ────────────────────────────────────────────────────────────────
export const initProfile = async (userId: string) => {
  const existingProfile = await DoctorProfile.findOne({ userId });
  if (existingProfile) {
    throw new AppError('Doctor profile already initialized.', HttpStatus.CONFLICT);
  }

  const profile = await DoctorProfile.create({ userId });
  return returnProfileWithStep(profile);
};

// ─── BASIC INFO ──────────────────────────────────────────────────────────
export const updateBasicInfo = async (userId: string, data: any) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  resetVerificationStatusIfChanged(profile);

  // Basic info is allowed to be edited even if approved
  profile.basicInfo = { ...profile.basicInfo, ...data };
  await profile.save();

  await checkAndUpdateProfileCompletion(profile._id.toString());
  return returnProfileWithStep(profile);
};

// ─── PROFESSIONAL INFO ───────────────────────────────────────────────────
export const updateProfessionalInfo = async (userId: string, data: any) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  if (!isBasicInfoCompleted(profile)) {
    throw new AppError('Please complete Basic Info first before proceeding to Professional Info.', HttpStatus.FORBIDDEN);
  }

  resetVerificationStatusIfChanged(profile);

  profile.professionalInfo = { ...profile.professionalInfo, ...data };
  await profile.save();

  await checkAndUpdateProfileCompletion(profile._id.toString());
  return returnProfileWithStep(profile);
};

// ─── QUALIFICATIONS ──────────────────────────────────────────────────────
export const addQualification = async (userId: string, data: any) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  if (!isBasicInfoCompleted(profile) || !isProfessionalInfoCompleted(profile)) {
    throw new AppError('Please complete Basic and Professional Info first before adding qualifications.', HttpStatus.FORBIDDEN);
  }

  resetVerificationStatusIfChanged(profile);

  profile.qualifications.push(data);
  await profile.save();

  await checkAndUpdateProfileCompletion(profile._id.toString());
  return returnProfileWithStep(profile);
};

export const updateQualification = async (userId: string, index: number, data: any) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);
  
  enforceEditLock(profile);
  resetVerificationStatusIfChanged(profile);

  if (index < 0 || index >= profile.qualifications.length) {
    throw new AppError('Qualification index out of bounds.', HttpStatus.BAD_REQUEST);
  }

  profile.qualifications[index] = { ...profile.qualifications[index], ...data };
  await profile.save();

  await checkAndUpdateProfileCompletion(profile._id.toString());
  return returnProfileWithStep(profile);
};

export const removeQualification = async (userId: string, index: number) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  enforceEditLock(profile);
  resetVerificationStatusIfChanged(profile);

  if (index < 0 || index >= profile.qualifications.length) {
    throw new AppError('Qualification index out of bounds.', HttpStatus.BAD_REQUEST);
  }

  profile.qualifications.splice(index, 1);
  await profile.save();

  await checkAndUpdateProfileCompletion(profile._id.toString());
  return returnProfileWithStep(profile);
};

// ─── CLINICS ─────────────────────────────────────────────────────────────
export const addClinic = async (userId: string, data: any) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  if (!isBasicInfoCompleted(profile) || !isProfessionalInfoCompleted(profile) || !isQualificationsCompleted(profile)) {
    throw new AppError('Please complete previous sequential steps before adding a clinic.', HttpStatus.FORBIDDEN);
  }

  resetVerificationStatusIfChanged(profile);

  profile.clinics.push(data);
  await profile.save();

  await checkAndUpdateProfileCompletion(profile._id.toString());
  return returnProfileWithStep(profile);
};

export const updateClinic = async (userId: string, index: number, data: any) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  enforceEditLock(profile);
  resetVerificationStatusIfChanged(profile);

  if (index < 0 || index >= profile.clinics.length) {
    throw new AppError('Clinic index out of bounds.', HttpStatus.BAD_REQUEST);
  }

  profile.clinics[index] = { ...profile.clinics[index], ...data };
  await profile.save();

  await checkAndUpdateProfileCompletion(profile._id.toString());
  return returnProfileWithStep(profile);
};

export const removeClinic = async (userId: string, index: number) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  // Note: user specifically mentioned that CLINICS CAN be deleted when approved.
  // So no enforceEditLock(profile) here!
  resetVerificationStatusIfChanged(profile);

  if (index < 0 || index >= profile.clinics.length) {
    throw new AppError('Clinic index out of bounds.', HttpStatus.BAD_REQUEST);
  }

  profile.clinics.splice(index, 1);
  await profile.save();

  await checkAndUpdateProfileCompletion(profile._id.toString());
  return returnProfileWithStep(profile);
};

// ─── GET & DELETE ────────────────────────────────────────────────────────
export const getProfileByUserId = async (userId: string) => {
  const profile = await DoctorProfile.findOne({ userId, isDeleted: false })
    .populate('userId', 'email role status')
    .populate('departmentId', 'departmentName');

  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  return returnProfileWithStep(profile);
};

export const deleteProfile = async (userId: string) => {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  profile.isDeleted = true;
  await profile.save();

  return returnProfileWithStep(profile);
};

// ─── ADMIN: VERIFY AND REVIEW ──────────────────────────────────────────────

export const getPendingProfiles = async () => {
  // Fetch profiles that finished their form (completed) but are waiting for admin action
  // This could mean strictly 'pending' or include 'change_requested' if you want admins to see everything unresolved
  const profiles = await DoctorProfile.find({
    isProfileCompleted: true,
    verificationStatus: 'pending',
    isDeleted: false,
  })
    .select('basicInfo professionalInfo verificationStatus isProfileCompleted createdAt userId')
    .populate('userId', 'email status');

  return profiles;
};

export const getProfileByIdAdmin = async (profileId: string) => {
  const profile = await DoctorProfile.findById(profileId)
    .populate('userId', 'email role status')
    .populate('departmentId', 'departmentName');

  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  return returnProfileWithStep(profile);
};

export const verifyProfile = async (
  profileId: string,
  status: 'pending' | 'approved' | 'rejected' | 'change_requested',
  feedback?: string
) => {
  const profile = await DoctorProfile.findById(profileId);
  if (!profile) throw new AppError('Profile not found.', HttpStatus.NOT_FOUND);

  if (profile.verificationStatus === status && profile.adminFeedback === feedback) {
    throw new AppError(`Profile is already ${status} with the same feedback.`, HttpStatus.BAD_REQUEST);
  }

  profile.verificationStatus = status;
  if (feedback !== undefined) {
    profile.adminFeedback = feedback;
  }
  
  await profile.save();

  return returnProfileWithStep(profile);
};
