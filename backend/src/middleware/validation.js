import { body, validationResult } from 'express-validator';
import ErrorHandler from '../utils/ErrorHandler.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return next(new ErrorHandler(errorMessages[0], 400));
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const complaintValidation = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('complaintType').trim().notEmpty().withMessage('Complaint type is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('locality').trim().notEmpty().withMessage('Locality is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

export const feedbackValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim(),
];

export const assignTeamValidation = [
  body('complaintId').isMongoId().withMessage('Invalid Complaint ID'),
  body('teamId').isMongoId().withMessage('Invalid Team ID'),
  body('remarks').optional().trim(),
];

export const escalateComplaintValidation = [
  body('complaintId').isMongoId().withMessage('Invalid Complaint ID'),
  body('wardOfficeId').isMongoId().withMessage('Invalid Ward Office ID'),
  body('remarks').optional().trim(),
];

export const updateStatusValidation = [
  body('status')
    .trim()
    .notEmpty()
    .isIn([
      'PENDING',
      'ASSIGNED',
      'IN_PROGRESS',
      'FORWARDED',
      'UNDER_REVIEW',
      'RESOLVED',
      'REJECTED',
    ])
    .withMessage('Invalid status'),
  body('remarks').optional().trim(),
];

export const createTeamValidation = [
  body('teamName').trim().notEmpty().withMessage('Team name is required'),
  body('departmentCategory')
    .trim()
    .notEmpty()
    .withMessage('Department category is required'),
  body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('availabilityStatus').optional().trim(),
];

export const updateTeamValidation = [
  body('teamName').optional().trim().notEmpty(),
  body('departmentCategory').optional().trim().notEmpty(),
  body('contactNumber').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('availabilityStatus').optional().trim(),
];

export const createWardOfficeValidation = [
  body('wardNumber').trim().notEmpty().withMessage('Ward number is required'),
  body('officeName').trim().notEmpty().withMessage('Office name is required'),
  body('locality').trim().notEmpty().withMessage('Locality is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

export const updateWardOfficeValidation = [
  body('wardNumber').optional().trim().notEmpty(),
  body('officeName').optional().trim().notEmpty(),
  body('locality').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().trim().notEmpty(),
  body('address').optional().trim().notEmpty(),
];
