import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Updated Interface to match your SQL Backend
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: string;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = 'http://localhost:5000/api/auth';

  // State Management
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private _currentUser$ = new BehaviorSubject<User | null>(null);

  public isLoggedIn$ = this._isLoggedIn$.asObservable();
  public currentUser$ = this._currentUser$.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeState();
  }

  /**
   * Restore session on app load
   */
  private initializeState() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          this._isLoggedIn$.next(true);
          this._currentUser$.next(JSON.parse(userStr));
        } catch (e) {
          this.logout(); // Clear corrupted data
        }
      }
    }
  }

  // 1. Registration
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // 2. Request Login OTP
  requestLoginOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email });
  }

  // 3. Verify OTP (Crucial Fix: handleAuthSuccess)
  verifyOtp(email: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-otp`, { email, otp })
      .pipe(
        tap(res => {
          if (res.token && res.user) {
            this.handleAuthSuccess(res.token, res.user);
          }
        })
      );
  }

  // 4. Fetch Profile (Fixes 401 error if using Interceptor)
  getProfile(): Observable<{ success: boolean, user: User }> {
    return this.http.get<{ success: boolean, user: User }>(`${this.apiUrl}/profile`).pipe(
      tap(res => {
        // Refresh local storage data with latest DB info
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this._currentUser$.next(res.user);
        }
      })
    );
  }

  // 5. Request Unban
  requestUnban(email: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-unban`, { email, reason });
  }

  /**
   * Centralized Auth Handler
   */
  private handleAuthSuccess(token: string, user: User) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userName', user.name);
    }
    this._isLoggedIn$.next(true);
    this._currentUser$.next(user);
  }

  // 6. Logout
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
    }
    this._isLoggedIn$.next(false);
    this._currentUser$.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }
}