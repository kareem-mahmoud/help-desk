import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request.js';

const router = Router();

router.post(
  '/validation-test',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .bail()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Email must be valid')
  ],
  validateRequest,
  (_request, response) => {
    response.status(200).json({ message: 'Request is valid' });
  }
);

export default router;
