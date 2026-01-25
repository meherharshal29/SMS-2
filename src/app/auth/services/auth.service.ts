import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: 'user';
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly authUrl = `${environment.apiUrl}/auth/user`;

  // --- Reactive State Management ---
  private _currentUser = signal<User | null>(null);
  private _isLoggedIn = signal<boolean>(false);

  // Public Signals for Components
  public currentUser = computed(() => this._currentUser());
  public isLoggedIn = computed(() => this._isLoggedIn());

  constructor() {
    this.initializeAuth();
  }

  /**
   * 1. Initialize Auth on Refresh
   * Restores data from localStorage and immediately verifies with Backend
   */
  private initializeAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Immediately populate state so UI doesn't flicker
          const user = JSON.parse(userData);
          this._currentUser.set(user);
          this._isLoggedIn.set(true);

          // Handshake: Verify if token is still valid on server
          this.syncProfile().subscribe();
        } catch (e) {
          this.logout();
        }
      }
    }
  }

  /**
   * 2. Sync Profile
   * Fetches fresh data from /profile. If 401 Unauthorized, triggers logout.
   */
  syncProfile(): Observable<any> {
    return this.http.get<any>(`${this.authUrl}/profile`).pipe(
      tap((res) => {
        if (res.success) {
          this.updateLocalState(res.user);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  // --- 3. Authentication Methods ---

  register(userData: Partial<User>): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, userData);
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token && res.user) {
          this.handleAuthSuccess(res.token, res.user);
        }
      })
    );
  }

  // --- 4. OTP Methods ---

  sendOtp(email: string): Observable<any> {
    return this.http.post(`${this.authUrl}/send-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/verify-otp`, { email, otp }).pipe(
      tap(res => {
        if (res.success && res.token && res.user) {
          this.handleAuthSuccess(res.token, res.user);
        }
      })
    );
  }

  /**
   * Persistence Helpers
   */
  private handleAuthSuccess(token: string, user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    this._currentUser.set(user);
    this._isLoggedIn.set(true);
  }

  private updateLocalState(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this._currentUser.set(user);
    this._isLoggedIn.set(true);
  }

  /**
   * 5. Logout
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    this.router.navigate(['/auth/login']);
  }
}