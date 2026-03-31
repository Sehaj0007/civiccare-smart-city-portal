import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';

import { initializeSocket } from './config/socketIO.js';
import { errorMiddleware } from './utils/errorUtils.js';
import logger from './config/logger.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supervisorRoutes from './routes/supervisorRoutes.js';
import supervisorAnalyticsRoutes from './routes/supervisorAnalyticsRoutes.js';
import setupRoutes from './routes/setupRoutes.js';
import staffRoutes from './routes/staffRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION - CRITICAL ORDER
// ============================================

// 1. CORS MIDDLEWARE (MUST BE FIRST)
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
    
    // Add default local origins
    const defaultOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://localhost:3000',
    ];
    
    const allOrigins = [...new Set([...allowedOrigins, ...defaultOrigins])];

    // Allow requests without origin (mobile apps, curl requests)
    if (!origin || allOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(null, true); // Allow all in dev, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// 2. Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(mongoSanitize());

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later',
  skip: (req) => req.path.startsWith('/api/auth'),
});
app.use(limiter);

// 4. Logging Middleware
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// 5. Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 6. Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Public test endpoint (NO AUTH)
app.get('/api/supervisor/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Supervisor routes are working!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/supervisor', supervisorAnalyticsRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/staff', staffRoutes);

// ============================================
// ERROR HANDLING & 404
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global Error Handler (MUST be last)
app.use(errorMiddleware);

// ============================================
// HTTP SERVER & SOCKET.IO
// ============================================

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

export { app, server };
