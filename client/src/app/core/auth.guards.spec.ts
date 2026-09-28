import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AuthService, UserRole } from './auth.service';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { roleGuard } from './role.guard';

describe('authentication route guards', () => {
  let auth: {
    ensureFreshSession: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
  };
  let router: Router;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    auth = {
      ensureFreshSession: vi.fn().mockReturnValue(of(false)),
      isAuthenticated: vi.fn().mockReturnValue(false),
      currentUser: vi.fn().mockReturnValue(null)
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }]
    });
    router = TestBed.inject(Router);
  });

  it('redirects unauthenticated users from protected routes to login', async () => {
    const result = await firstValueFrom(TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, state)) as Observable<boolean | UrlTree>);
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('redirects authenticated users away from guest routes', async () => {
    auth.ensureFreshSession.mockReturnValue(of(true));
    const result = await firstValueFrom(TestBed.runInInjectionContext(() => guestGuard({} as ActivatedRouteSnapshot, state)) as Observable<boolean | UrlTree>);
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('allows a user whose role is permitted', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.currentUser.mockReturnValue({ role: 'admin' satisfies UserRole });
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    expect(TestBed.runInInjectionContext(() => roleGuard(route, state))).toBe(true);
  });

  it('redirects authenticated users with a disallowed role to dashboard', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.currentUser.mockReturnValue({ role: 'customer' satisfies UserRole });
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('redirects unauthenticated users from role-restricted routes to login', () => {
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
