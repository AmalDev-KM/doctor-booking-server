import { Request, Response } from 'express';
import * as doctorProfileService from '../services/doctorProfile.service';
import { sendSuccess } from '../utils/responseHandler';
import { HttpStatus } from '../constants';
import asyncHandler from '../utils/asyncHandler';

// ─── INIT ────────────────────────────────────────────────────────────────
export const initProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await doctorProfileService.initProfile(userId);
  sendSuccess(res, 'Doctor profile initialized successfully.', profile, HttpStatus.CREATED);
});

// ─── BASIC INFO ──────────────────────────────────────────────────────────
export const updateBasicInfo = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await doctorProfileService.updateBasicInfo(userId, req.body);
  sendSuccess(res, 'Basic info updated successfully.', profile);
});

// ─── PROFESSIONAL INFO ───────────────────────────────────────────────────
export const updateProfessionalInfo = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await doctorProfileService.updateProfessionalInfo(userId, req.body);
  sendSuccess(res, 'Professional info updated successfully.', profile);
});

// ─── QUALIFICATIONS ──────────────────────────────────────────────────────
export const addQualification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await doctorProfileService.addQualification(userId, req.body);
  sendSuccess(res, 'Qualification added successfully.', profile, HttpStatus.CREATED);
});

export const updateQualification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const index = parseInt(req.params.index as string, 10);
  const profile = await doctorProfileService.updateQualification(userId, index, req.body);
  sendSuccess(res, 'Qualification updated successfully.', profile);
});

export const removeQualification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const index = parseInt(req.params.index as string, 10);
  const profile = await doctorProfileService.removeQualification(userId, index);
  sendSuccess(res, 'Qualification removed successfully.', profile);
});

// ─── CLINICS ─────────────────────────────────────────────────────────────
export const addClinic = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await doctorProfileService.addClinic(userId, req.body);
  sendSuccess(res, 'Clinic added successfully.', profile, HttpStatus.CREATED);
});

export const updateClinic = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const index = parseInt(req.params.index as string, 10);
  const profile = await doctorProfileService.updateClinic(userId, index, req.body);
  sendSuccess(res, 'Clinic updated successfully.', profile);
});

export const removeClinic = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const index = parseInt(req.params.index as string, 10);
  const profile = await doctorProfileService.removeClinic(userId, index);
  sendSuccess(res, 'Clinic removed successfully.', profile);
});

// ─── GET & DELETE ────────────────────────────────────────────────────────
export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await doctorProfileService.getProfileByUserId(userId);
  sendSuccess(res, 'Profile retrieved successfully.', profile);
});

export const deleteMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await doctorProfileService.deleteProfile(userId);
  sendSuccess(res, 'Profile deleted successfully.');
});

// ─── ADMIN: VERIFY ───────────────────────────────────────────────────────
export const verifyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profileId = req.params.id as string;
  const { status } = req.body;
  const profile = await doctorProfileService.verifyProfile(profileId, status);
  sendSuccess(res, `Profile status updated to ${status}.`, profile);
});
