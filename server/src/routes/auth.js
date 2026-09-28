import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { validateRequest } from '../middleware/validate-request.js';
import { toSafeUserResponse } from '../utils/user-response.js';
import {
  createAccessToken,
  createRefreshToken,
  ACCESS_TOKEN_TTL_SECONDS_VALUE
} from '../utils/auth-tokens.js';
import { loginValidationSchema, registrationValidationSchema } from '../validation/auth-validation.js';

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

router.post('/login', loginValidationSchema, validateRequest, async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return response.status(403).json({ error: 'This account is inactive' });
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken();

  user.refreshTokenData.push({ tokenHash: refreshToken.tokenHash, expiresAt: refreshToken.expiresAt });
  await user.save();

  return response.status(200).json({
    accessToken,
    refreshToken: refreshToken.token,
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_TTL_SECONDS_VALUE,
    user: toSafeUserResponse(user)
  });
});

export default router;
