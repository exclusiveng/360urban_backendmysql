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
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Go up two levels from dist/src/main.js to root, then to uploads
// const rootDir = path.join(__dirname, '../../');
// Better approach: use process.cwd() which typically points to the project root
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
app.get('/health', (req: Request, res: Response) => {
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
