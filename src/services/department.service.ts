import Department, { IDepartment } from '../models/department.model';
import AppError from '../utils/AppError';
import { HttpStatus, Messages } from '../constants';
import logger from '../utils/logger';
import { uploadOnCloudinary, deleteFromCloudinary } from '../helpers/cloudinary.helper';

// ─── Create Department ────────────────────────────────────────────────────────
interface CreateDepartmentPayload {
  departmentName: string;
  departmentDescription: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const createDepartment = async (
  payload: CreateDepartmentPayload,
  filePath?: string
): Promise<IDepartment> => {
  const { departmentName, departmentDescription, status } = payload;

  const existingDepartment = await Department.findOne({ departmentName });
  if (existingDepartment) {
    throw new AppError(Messages.DEPARTMENT_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }

  if (!filePath) {
    throw new AppError('Department image is required.', HttpStatus.BAD_REQUEST);
  }

  // Upload to Cloudinary
  const uploadResult = await uploadOnCloudinary(filePath);
  if (!uploadResult) {
    throw new AppError('Failed to upload department image.', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const department = await Department.create({
    departmentName,
    departmentDescription,
    status: status || 'ACTIVE',
    departmentImage: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
  });

  logger.info(`Department created: ${departmentName}`);
  return department;
};

// ─── Get All Departments ──────────────────────────────────────────────────────
export const getDepartments = async (): Promise<IDepartment[]> => {
  // Retrieve all active and inactive departments. Could add pagination here later.
  return Department.find().sort({ createdAt: -1 });
};

// ─── Get Department By Id ─────────────────────────────────────────────────────
export const getDepartmentById = async (id: string): Promise<IDepartment> => {
  const department = await Department.findById(id);
  if (!department) {
    throw new AppError(Messages.DEPARTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
  return department;
};

// ─── Update Department ────────────────────────────────────────────────────────
interface UpdateDepartmentPayload {
  departmentName?: string;
  departmentDescription?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const updateDepartment = async (
  id: string,
  payload: UpdateDepartmentPayload,
  filePath?: string
): Promise<IDepartment> => {
  const department = await Department.findById(id);
  if (!department) {
    throw new AppError(Messages.DEPARTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  // If departmentName is being changed, ensure it's not conflicting
  if (payload.departmentName && payload.departmentName !== department.departmentName) {
    const existingDepartment = await Department.findOne({ departmentName: payload.departmentName });
    if (existingDepartment) {
      throw new AppError(Messages.DEPARTMENT_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }
    department.departmentName = payload.departmentName;
  }

  if (payload.departmentDescription) department.departmentDescription = payload.departmentDescription;
  if (payload.status) department.status = payload.status;

  // Handle image replacement if a new file is uploaded
  if (filePath) {
    // Delete old image from cloudinary first
    if (department.imagePublicId) {
      await deleteFromCloudinary(department.imagePublicId);
    }
    
    // Upload new image
    const uploadResult = await uploadOnCloudinary(filePath);
    if (!uploadResult) {
      throw new AppError('Failed to upload new department image.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    department.departmentImage = uploadResult.secure_url;
    department.imagePublicId = uploadResult.public_id;
  }

  await department.save();
  logger.info(`Department updated: ${department.departmentName}`);
  return department;
};

// ─── Delete Department ────────────────────────────────────────────────────────
export const deleteDepartment = async (id: string): Promise<void> => {
  const department = await Department.findById(id);
  if (!department) {
    throw new AppError(Messages.DEPARTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  // Business Rule: Standard choice is to not delete if attached entities exist
  if (department.totalDoctors > 0 || department.totalPatients > 0) {
    throw new AppError(
      'Cannot delete a department that has doctors or patients attached. Consider making it inactive.',
      HttpStatus.BAD_REQUEST
    );
  }

  // Delete image from cloudinary
  if (department.imagePublicId) {
    await deleteFromCloudinary(department.imagePublicId);
  }

  // Delete from DB
  await department.deleteOne();
  logger.info(`Department deleted: ${department.departmentName}`);
};
