import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, AuthSession, SafeUser } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const user: SafeUser = {
    id: 'user-1',
    name: 'Test Customer',
    email: 'customer@example.test',
    role: 'customer',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  };

  const session: AuthSession = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user
  };

  beforeEach(() => {
    window.sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('stores the authenticated user and tokens after login', () => {
    service.login({ email: user.email, password: 'secret' }).subscribe();
    http.expectOne('http://localhost:3000/api/auth/login').flush(session);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(user);
    expect(service.accessToken()).toBe('access-token');
    expect(window.sessionStorage.getItem('helpdesk.auth.session')).toContain('refresh-token');
  });

  it('clears the local session immediately on logout', () => {
    service.login({ email: user.email, password: 'secret' }).subscribe();
    http.expectOne('http://localhost:3000/api/auth/login').flush(session);

    service.logout().subscribe();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(window.sessionStorage.getItem('helpdesk.auth.session')).toBeNull();
    http.expectOne('http://localhost:3000/api/auth/logout').flush(null);
  });

  it('sends registration without creating an authenticated session', () => {
    service.register({ name: user.name, email: user.email, password: 'secret' }).subscribe();
    http.expectOne('http://localhost:3000/api/auth/register').flush({ user });
    expect(service.isAuthenticated()).toBe(false);
  });
});
