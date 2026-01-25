import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, of, interval, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Injectable, inject, PLATFORM_ID, signal, computed, OnDestroy } from '@angular/core';

// --- Interfaces ---
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin';
}

export interface DashboardData {
  totalRevenue: number;
  activeRentals: number;
  totalUsers: number;
  totalOrders: number;
  onlineUsers: number;
  cancelledCount: number;
}

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isOnline: boolean;
  isActive: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService implements OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private authUrl = `${environment.apiUrl}/auth/admin`;
  private adminUrl = `${environment.apiUrl}/admin`;

  private pollingSub?: Subscription;

  // --- Reactive State Management (Signals) ---
  private _currentAdmin = signal<AdminUser | null>(null);
  private _isLoggedIn = signal<boolean>(false);
  private _dashboardStats = signal<DashboardData | null>(null);
  private _managedUsers = signal<ManagedUser[]>([]);

  // --- Public Read-Only Signals ---
  public currentAdmin = this._currentAdmin.asReadonly();
  public isLoggedIn = computed(() => this._isLoggedIn());
  public dashboardStats = this._dashboardStats.asReadonly();
  public managedUsers = this._managedUsers.asReadonly();

  public onlineUserCount = computed(() =>
    this._managedUsers().filter(u => u.isOnline).length
  );

  constructor() {
    this.checkInitialAuth();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private checkInitialAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('adminUser');

      if (token && savedAdmin) {
        try {
          this._currentAdmin.set(JSON.parse(savedAdmin));
          this._isLoggedIn.set(true);
          this.syncAdminProfile().subscribe();
          this.startPolling();
        } catch (e) {
          this.logout();
        }
      }
    }
  }

  private startPolling(): void {
    if (isPlatformBrowser(this.platformId) && !this.pollingSub) {
      this.pollingSub = interval(30000).subscribe(() => {
        if (this._isLoggedIn()) {
          this.getDashboard().subscribe();
        }
      });
    }
  }

  private stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  syncAdminProfile(): Observable<any> {
    return this.http.get<any>(`${this.authUrl}/profile`).pipe(
      tap(res => {
        if (res.success) this.updateLocalAdmin(res.admin);
      }),
      catchError(() => {
        this.logout();
        return of({ success: false });
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('adminToken', res.token);
          }
          this.updateLocalAdmin(res.admin);
          this.startPolling();
        }
      })
    );
  }

  logout(): void {
    this.stopPolling();

    this.http.post(`${this.adminUrl}/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }

    this._currentAdmin.set(null);
    this._isLoggedIn.set(false);
    this._dashboardStats.set(null);
    this._managedUsers.set([]);
    this.router.navigate(['/admin/login']);
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/dashboard`).pipe(
      tap(res => {
        if (res.success) this._dashboardStats.set(res.stats);
      }),
      catchError(() => of({ success: false }))
    );
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.adminUrl}/order-status/${orderId}`, { status }).pipe(
      tap(res => {
        if (res.success) this.getDashboard().subscribe();
      })
    );
  }

  fetchUsers(): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/users`).pipe(
      tap(res => {
        if (res.success) {
          const processed = res.users.sort((a: ManagedUser, b: ManagedUser) =>
            (b.isOnline === a.isOnline) ? 0 : b.isOnline ? 1 : -1
          );
          this._managedUsers.set(processed);
        }
      }),
      catchError(() => of({ success: false }))
    );
  }

  updateUser(userId: number, userData: Partial<ManagedUser>): Observable<any> {
    return this.http.put<any>(`${this.adminUrl}/users/${userId}`, userData).pipe(
      tap(res => {
        if (res.success) {
          this._managedUsers.update(users =>
            users.map(u => u.id === userId ? { ...u, ...userData } : u)
          );
        }
      })
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/users/${userId}`).pipe(
      tap(res => {
        if (res.success) {
          this._managedUsers.update(users => users.filter(u => u.id !== userId));
        }
      })
    );
  }

  private updateLocalAdmin(admin: AdminUser) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('adminUser', JSON.stringify(admin));
    }
    this._currentAdmin.set(admin);
    this._isLoggedIn.set(true);
  }
}