import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!allowedRoles?.length || allowedRoles.includes(authService.currentUser()?.role as UserRole)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
