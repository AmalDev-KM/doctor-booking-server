import { Request, Response } from 'express';
import * as departmentService from '../services/department.service';
import { sendSuccess } from '../utils/responseHandler';
import { HttpStatus, Messages } from '../constants';
import asyncHandler from '../utils/asyncHandler';

// ─── POST /api/departments ──────────────────────────────────────────────────────
export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const filePath = req.file?.path;
  const department = await departmentService.createDepartment(req.body, filePath);
  sendSuccess(res, Messages.DEPARTMENT_CREATED, department, HttpStatus.CREATED);
});

// ─── GET /api/departments ───────────────────────────────────────────────────────
export const getDepartments = asyncHandler(async (req: Request, res: Response) => {
  const departments = await departmentService.getDepartments();
  sendSuccess(res, 'Departments retrieved successfully.', departments);
});

// ─── GET /api/departments/:id ───────────────────────────────────────────────────
export const getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.getDepartmentById(req.params.id as string);
  sendSuccess(res, 'Department retrieved successfully.', department);
});

// ─── PUT /api/departments/:id ───────────────────────────────────────────────────
export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const filePath = req.file?.path;
  const department = await departmentService.updateDepartment(req.params.id as string, req.body, filePath);
  sendSuccess(res, Messages.DEPARTMENT_UPDATED, department);
});

// ─── DELETE /api/departments/:id ────────────────────────────────────────────────
export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  await departmentService.deleteDepartment(req.params.id as string);
  sendSuccess(res, Messages.DEPARTMENT_DELETED);
});
