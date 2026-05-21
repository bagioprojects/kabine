import { Request, Response, NextFunction } from 'express';

// Standardized error response format for API clients
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);

  // Differentiate between API responses and Web Admin responses
  if (req.path.startsWith('/api')) {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  } else {
    // Render error page for Web Admin
    res.status(statusCode).render('error', { 
      message,
      statusCode
    });
  }
};
