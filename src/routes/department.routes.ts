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

// Protect ALL department routes - Require authentication
router.use(authenticate);

/**
 * @route   POST /api/departments
 * @desc    Create a new department
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authorize(UserRole.ADMIN),
  upload.single('departmentImage'),
  validate(createDepartmentValidator),
  departmentController.createDepartment
);

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private (Any logged-in user)
 */
router.get('/', departmentController.getDepartments);

/**
 * @route   GET /api/departments/:id
 * @desc    Get a single department by ID
 * @access  Private (Admin only)
 */
router.get('/:id', authorize(UserRole.ADMIN), departmentController.getDepartmentById);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update a department by ID
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  upload.single('departmentImage'),
  validate(updateDepartmentValidator),
  departmentController.updateDepartment
);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete a department by ID
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize(UserRole.ADMIN), departmentController.deleteDepartment);

export default router;
