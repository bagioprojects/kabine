import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// Import Routes
import apiV1Routes from './routes/v1';

// Import Middleware
import { errorMiddleware } from './middlewares/errorMiddleware';
import { securitySanitizer } from './middlewares/securityMiddleware';

const app = express();

// Security and Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securitySanitizer);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Register Routes
app.use('/api/v1', apiV1Routes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
