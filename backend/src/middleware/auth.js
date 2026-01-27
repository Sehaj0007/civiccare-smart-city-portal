import { verifyToken } from '../utils/tokenUtils.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ErrorHandler('Please login to access this route', 401));
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return next(new ErrorHandler('Invalid or expired token', 401));
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler('User not found', 404));
    }

    next();
  } catch (error) {
    next(new ErrorHandler('Authentication failed', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

export const adminOfCategory = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return next(new ErrorHandler('Only admins can access this route', 403));
  }
  next();
};
