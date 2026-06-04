import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import organizationsRoutes from './modules/organizations/organizations.routes';
import marketplaceRoutes from './modules/marketplace/marketplace.routes';
import eventsRoutes from './modules/events/events.routes';
import contentRoutes from './modules/content/content.routes';
import consultantsRoutes from './modules/consultants/consultants.routes';
import adminRoutes from './modules/admin/admin.routes';

// Middleware imports
import errorHandler from './middleware/errorHandler';

// ============================================================
// Express Application Setup
// ============================================================

const app: Application = express();

// ---- Security Middleware ----
app.use(helmet());

// ---- CORS ----
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---- Rate Limiting ----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// More aggressive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// ---- Body Parsing ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Logging ----
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================
// API Routes
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/consultants', consultantsRoutes);
app.use('/api/admin', adminRoutes);

// ---- Health Check ----
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'BizGrowth API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ---- 404 Handler ----
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ---- Global Error Handler (must be last) ----
app.use(errorHandler);

export default app;
