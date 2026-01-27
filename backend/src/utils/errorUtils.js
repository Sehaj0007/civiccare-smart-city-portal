import ErrorHandler from './ErrorHandler.js';
import logger from '../config/logger.js';

export const catchAsyncErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log the error
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (err.stack) {
    logger.error(err.stack);
  }

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid JSON Web Token';
    err = new ErrorHandler(message, 400);
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    const message = 'JSON Web Token has expired';
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
