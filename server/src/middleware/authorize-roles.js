import { ROLES } from '../constants/roles.js';

export function authorizeRoles(...allowedRoles) {
  if (allowedRoles.some((role) => !ROLES.includes(role))) {
    throw new TypeError('authorizeRoles received an unknown role');
  }

  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ error: 'You are not allowed to access this resource' });
    }

    return next();
  };
}
