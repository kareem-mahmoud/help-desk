import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';

export type UserRole = 'customer' | 'agent' | 'admin';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: SafeUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: SafeUser;
}

interface StoredAuthSession extends AuthSession {
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly session = signal<StoredAuthSession | null>(this.restoreSession());
  private refreshInFlight: Observable<AuthSession> | null = null;
  private sessionGeneration = 0;

  readonly currentUser = computed(() => this.session()?.user ?? null);

  isAuthenticated(): boolean {
    const session = this.session();
    return Boolean(session?.accessToken && session.expiresAt > Date.now());
  }

  hasRole(role: UserRole): boolean {
    return this.isAuthenticated() && this.currentUser()?.role === role;
  }

  accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.apiUrl}/login`, payload).pipe(
      tap((authSession) => this.storeSession(authSession))
    );
  }

  refreshSession(): Observable<AuthSession> {
    if (this.refreshInFlight) return this.refreshInFlight;

    const currentSession = this.session();
    if (!currentSession?.refreshToken) {
      return throwError(() => new Error('No refresh token is available'));
    }

    const generation = this.sessionGeneration;
    let request: Observable<AuthSession>;
    request = this.http.post<AuthSession>(`${this.apiUrl}/refresh`, {
      refreshToken: currentSession.refreshToken
    }).pipe(
      map((authSession) => {
        if (
          generation !== this.sessionGeneration ||
          this.session()?.refreshToken !== currentSession.refreshToken
        ) {
          throw new Error('The authentication session has ended');
        }
        this.storeSession(authSession);
        return authSession;
      }),
      finalize(() => {
        if (this.refreshInFlight === request) this.refreshInFlight = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.refreshInFlight = request;
    return request;
  }

  ensureFreshSession(): Observable<boolean> {
    const session = this.session();
    if (!session) return of(false);
    if (session.expiresAt > Date.now() + 5000) return of(true);

    return this.refreshSession().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.session()?.refreshToken;
    this.clearSession();

    if (!refreshToken) return of(void 0);

    return this.http.post<void>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      catchError(() => of(void 0))
    );
  }

  clearSession(): void {
    this.sessionGeneration += 1;
    this.refreshInFlight = null;
    this.session.set(null);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem('helpdesk.auth.session');
      } catch {
        // Keep the in-memory session cleared even when browser storage is unavailable.
      }
    }
  }

  private storeSession(authSession: AuthSession): void {
    this.sessionGeneration += 1;
    const storedSession: StoredAuthSession = {
      ...authSession,
      expiresAt: Date.now() + authSession.expiresIn * 1000
    };
    this.session.set(storedSession);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem('helpdesk.auth.session', JSON.stringify(storedSession));
      } catch {
        // The in-memory session still works for this tab if storage is unavailable.
      }
    }
  }

  private restoreSession(): StoredAuthSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = window.sessionStorage.getItem('helpdesk.auth.session');
      if (!stored) return null;

      const parsed = JSON.parse(stored) as Partial<StoredAuthSession>;
      if (
        typeof parsed.accessToken === 'string' &&
        typeof parsed.refreshToken === 'string' &&
        parsed.tokenType === 'Bearer' &&
        typeof parsed.expiresAt === 'number' &&
        parsed.user &&
        typeof parsed.user.id === 'string'
      ) {
        return parsed as StoredAuthSession;
      }
    } catch {
      // Ignore malformed or inaccessible browser storage and start signed out.
    }

    return null;
  }
}
