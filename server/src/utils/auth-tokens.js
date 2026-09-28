import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const developmentSecret = process.env.NODE_ENV === 'production' || process.env.JWT_ACCESS_SECRET
  ? null
  : randomBytes(32).toString('base64url');

function getAccessTokenSecret() {
  const secret = process.env.JWT_ACCESS_SECRET ?? developmentSecret;

  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET must be set in production');
  }

  return secret;
}

export function createAccessToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ sub: String(user._id), role: user.role, iat: now, exp: now + ACCESS_TOKEN_TTL_SECONDS })
  ).toString('base64url');
  const unsignedToken = `${header}.${payload}`;
  const signature = createHmac('sha256', getAccessTokenSecret()).update(unsignedToken).digest('base64url');

  return `${unsignedToken}.${signature}`;
}

export function verifyAccessToken(token) {
  if (typeof token !== 'string') return null;

  const segments = token.split('.');
  if (segments.length !== 3 || segments.some((segment) => !segment)) return null;

  const [headerSegment, payloadSegment, signatureSegment] = segments;
  let header;
  let claims;

  try {
    header = JSON.parse(Buffer.from(headerSegment, 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (header?.alg !== 'HS256' || header?.typ !== 'JWT') return null;

  const signingInput = `${headerSegment}.${payloadSegment}`;
  const expectedSignature = createHmac('sha256', getAccessTokenSecret())
    .update(signingInput)
    .digest();
  const receivedSignature = Buffer.from(signatureSegment, 'base64url');

  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    typeof claims?.sub !== 'string' ||
    !claims.sub ||
    typeof claims.exp !== 'number' ||
    claims.exp <= now ||
    (typeof claims.nbf === 'number' && claims.nbf > now)
  ) {
    return null;
  }

  return claims;
}

export function createRefreshToken() {
  const token = randomBytes(48).toString('base64url');

  return {
    token,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  };
}

export function hashRefreshToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export const ACCESS_TOKEN_TTL_SECONDS_VALUE = ACCESS_TOKEN_TTL_SECONDS;
