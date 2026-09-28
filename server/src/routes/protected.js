import { Router } from 'express';
import { ROLE } from '../constants/roles.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize-roles.js';
import { toSafeUserResponse } from '../utils/user-response.js';

const router = Router();

router.get('/test', authenticate, (request, response) => {
  response.status(200).json({
    message: 'You are authenticated',
    user: toSafeUserResponse(request.user)
  });
});

router.get('/admin-test', authenticate, authorizeRoles(ROLE.ADMIN), (_request, response) => {
  response.status(200).json({ message: 'Administrator access granted' });
});

export default router;
