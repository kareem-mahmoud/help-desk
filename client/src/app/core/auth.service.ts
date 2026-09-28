import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
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

  readonly currentUser = computed(() => this.session()?.user ?? null);

  isAuthenticated(): boolean {
    const session = this.session();
    return Boolean(session?.accessToken && session.expiresAt > Date.now());
  }

  accessToken(): string | null {
    return this.isAuthenticated() ? this.session()?.accessToken ?? null : null;
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.apiUrl}/login`, payload).pipe(
      tap((authSession) => this.storeSession(authSession))
    );
  }

  logout(): void {
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
        parsed.expiresAt > Date.now() &&
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
