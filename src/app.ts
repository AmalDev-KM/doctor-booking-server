import express, { Application, Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes';
import errorHandler from './middlewares/error.middleware';
import { HttpStatus } from './constants';

const app: Application = express();

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Max 100 requests per IP globally
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

// ─── Core Middlewares ─────────────────────────────────────────────────────────
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));           // Parse JSON, limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.removeHeader('X-Powered-By');
  next();
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: 'The requested resource was not found.',
  });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
