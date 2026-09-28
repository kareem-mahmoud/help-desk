import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const accessToken = inject(AuthService).accessToken();

  const isProtectedApiRequest = request.url.startsWith('http://localhost:3000/api/') &&
    !request.url.includes('/api/auth/');

  if (!accessToken || !isProtectedApiRequest) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }));
};
