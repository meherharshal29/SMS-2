import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminUserDetailsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;
  private readonly backendUrl = 'http://localhost:5000';

  /** Normalizes image paths for Gear and Packages */
  private fixImagePaths(data: any): any {
    // Fix Gear Rental Images
    if (data.orderHistory) {
      data.orderHistory = data.orderHistory.map((order: any) => {
        if (order.Camera?.images) {
          order.Camera.images = order.Camera.images.map((img: any) => ({
            ...img,
            url: img.url.startsWith('http') ? img.url : `${this.backendUrl}/${img.url.replace(/\\/g, '/')}`
          }));
        }
        return order;
      });
    }

    // Fix Package Cover Images
    if (data.bookingHistory) {
      data.bookingHistory = data.bookingHistory.map((booking: any) => {
        if (booking.package?.coverImage) {
          const img = booking.package.coverImage;
          booking.package.coverImage = img.startsWith('http') ? img : `${this.backendUrl}/${img.replace(/\\/g, '/')}`;
        }
        return booking;
      });
    }
    return data;
  }

  /** Gets full profile context (Profile + Orders + Bookings) */
  getUserFullDetails(userId: string | number): Observable<any> {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '');

    return this.http.get<any>(`${this.baseUrl}/users/${userId}/full-details`, { headers }).pipe(
      map(res => {
        if (res.success && res.data) {
          res.data = this.fixImagePaths(res.data);
        }
        return res;
      })
    );
  }

  /** * NEW: Fetch only package bookings for a particular user 
   * Matches backend: router.get('/admin/bookings/user/:userId', ...)
   */
  getUserBookings(userId: string | number): Observable<any> {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '');

    return this.http.get<any>(`${environment.apiUrl}/packages/admin/bookings/user/${userId}`, { headers }).pipe(
      map(res => {
        if (res.success && res.data) {
          // Wrap in object to reuse fixImagePaths logic
          const normalized = this.fixImagePaths({ bookingHistory: res.data });
          res.data = normalized.bookingHistory;
        }
        return res;
      })
    );
  }
}