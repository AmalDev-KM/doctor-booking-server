import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import departmentRoutes from './department.routes';
import doctorProfileRoutes from './doctorProfile.routes';

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🟢 DocBook API is running.',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── Mount Route Modules ──────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/doctor-profile', doctorProfileRoutes);

// Future phases - uncomment as needed:
// router.use('/doctors', doctorRoutes);
// router.use('/patients', patientRoutes);
// router.use('/appointments', appointmentRoutes);

export default router;
