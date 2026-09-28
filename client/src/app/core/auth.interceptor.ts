import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, of, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

const AUTH_RETRIED = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isProtectedApiRequest = request.url.startsWith('http://localhost:3000/api/') &&
    !request.url.includes('/api/auth/');

  if (!isProtectedApiRequest) return next(request);

  const sentToken = authService.accessToken();
  const authorizedRequest = sentToken
    ? request.clone({ setHeaders: { Authorization: `Bearer ${sentToken}` } })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (request.context.get(AUTH_RETRIED)) {
        authService.clearSession();
        void router.navigate(['/login'], { state: { sessionExpired: true } });
        return throwError(() => error);
      }

      const latestToken = authService.accessToken();
      const token$ = latestToken && latestToken !== sentToken
        ? of(latestToken)
        : authService.refreshSession().pipe(map((session) => session.accessToken));

      return token$.pipe(
        catchError((refreshError: unknown) => {
          authService.clearSession();
          void router.navigate(['/login'], { state: { sessionExpired: true } });
          return throwError(() => refreshError);
        }),
        switchMap((freshToken) => {
          const retry = request.clone({
            setHeaders: { Authorization: `Bearer ${freshToken}` },
            context: request.context.set(AUTH_RETRIED, true)
          });
          return next(retry).pipe(
            catchError((retryError: unknown) => {
              if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
                authService.clearSession();
                void router.navigate(['/login'], { state: { sessionExpired: true } });
              }
              return throwError(() => retryError);
            })
          );
        })
      );
    })
  );
};
