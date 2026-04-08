import { Router } from 'express';
import * as departmentController from '../controllers/department.controller';
import validate from '../middlewares/validate.middleware';
import {
  createDepartmentValidator,
  updateDepartmentValidator,
} from '../validators/department.validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { UserRole } from '../constants';

const router = Router();

// Protect ALL department routes - Only Admins can manage or view departments from this endpoint for now
router.use(authenticate, authorize(UserRole.ADMIN));

/**
 * @route   POST /api/departments
 * @desc    Create a new department
 * @access  Private (Admin only)
 */
router.post(
  '/',
  upload.single('departmentImage'),
  validate(createDepartmentValidator),
  departmentController.createDepartment
);

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private (Admin only)
 */
router.get('/', departmentController.getDepartments);

/**
 * @route   GET /api/departments/:id
 * @desc    Get a single department by ID
 * @access  Private (Admin only)
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update a department by ID
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  upload.single('departmentImage'),
  validate(updateDepartmentValidator),
  departmentController.updateDepartment
);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete a department by ID
 * @access  Private (Admin only)
 */
router.delete('/:id', departmentController.deleteDepartment);

export default router;
