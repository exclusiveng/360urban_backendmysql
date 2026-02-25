/// <reference types="node" />
import 'reflect-metadata';
import express, {Request, Response} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { AppDataSource } from './config/database.js';
import { config } from './config/config.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import areaRoutes from './routes/areaRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import path from 'path';

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Serve static files (uploads)
const rootDir = process.cwd();
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('✓ Database initialized successfully');

    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${config.node_env}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
