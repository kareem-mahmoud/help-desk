import mongoose from 'mongoose';
import User from '../models/user.js';
import { verifyAccessToken } from '../utils/auth-tokens.js';

const unauthorized = (response) => response.status(401).json({ error: 'Authentication required' });

export async function authenticate(request, response, next) {
  const authorization = request.get('authorization') ?? '';
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  if (!match) return unauthorized(response);

  let claims;
  try {
    claims = verifyAccessToken(match[1]);
  } catch (error) {
    return next(error);
  }

  if (!claims || !mongoose.isValidObjectId(claims.sub)) {
    return unauthorized(response);
  }

  try {
    const user = await User.findById(claims.sub);
    if (!user || !user.isActive) return unauthorized(response);

    request.user = user;
    request.auth = { userId: String(user._id), role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
}
