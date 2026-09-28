import { body } from 'express-validator';

export const registrationValidationSchema = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .bail()
    .customSanitizer((email) => email.toLowerCase()),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .bail()
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('Password must not exceed 72 bytes')
];

export const loginValidationSchema = [
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .bail()
    .customSanitizer((email) => email.toLowerCase()),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .notEmpty()
    .withMessage('Password is required')
];
