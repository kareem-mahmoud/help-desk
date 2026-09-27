import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { validateRequest } from '../middleware/validate-request.js';
import { toSafeUserResponse } from '../utils/user-response.js';
import { registrationValidationSchema } from '../validation/auth-validation.js';

const router = Router();
const BCRYPT_ROUNDS = 12;

router.post('/register', registrationValidationSchema, validateRequest, async (request, response) => {
  const { name, email, password } = request.body;

  try {
    const existingUser = await User.exists({ email });
    if (existingUser) {
      return response.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    return response.status(201).json({ user: toSafeUserResponse(user) });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return response.status(409).json({ error: 'Email is already registered' });
    }

    throw error;
  }
});

export default router;
