import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { validateRequest } from '../middleware/validate-request.js';
import { toSafeUserResponse } from '../utils/user-response.js';
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  ACCESS_TOKEN_TTL_SECONDS_VALUE
} from '../utils/auth-tokens.js';
import {
  loginValidationSchema,
  logoutValidationSchema,
  refreshValidationSchema,
  registrationValidationSchema
} from '../validation/auth-validation.js';

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

router.post('/refresh', refreshValidationSchema, validateRequest, async (request, response) => {
  const oldTokenHash = hashRefreshToken(request.body.refreshToken);
  const nextRefreshToken = createRefreshToken();
  const user = await User.findOneAndUpdate(
    {
      isActive: true,
      refreshTokenData: {
        $elemMatch: { tokenHash: oldTokenHash, expiresAt: { $gt: new Date() } }
      }
    },
    {
      $set: {
        'refreshTokenData.$.tokenHash': nextRefreshToken.tokenHash,
        'refreshTokenData.$.expiresAt': nextRefreshToken.expiresAt
      }
    },
    { new: true }
  );

  if (!user) {
    return response.status(401).json({ error: 'Refresh token is invalid or expired' });
  }

  return response.status(200).json({
    accessToken: createAccessToken(user),
    refreshToken: nextRefreshToken.token,
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_TTL_SECONDS_VALUE,
    user: toSafeUserResponse(user)
  });
});

router.post('/logout', logoutValidationSchema, validateRequest, async (request, response) => {
  const tokenHash = hashRefreshToken(request.body.refreshToken);

  await User.updateOne(
    { 'refreshTokenData.tokenHash': tokenHash },
    { $pull: { refreshTokenData: { tokenHash } } }
  );

  return response.status(204).end();
});

export default router;
