// admin-user-details.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminUserDetailsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;
  private readonly backendUrl = 'http://localhost:5000'; // Match your backend port

  private fixImages(orders: any[]): any[] {
    return orders.map(order => {
      if (order.Camera && order.Camera.images) {
        order.Camera.images = order.Camera.images.map((img: any) => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `${this.backendUrl}/${img.url.replace(/\\/g, '/')}`
        }));
      }
      return order;
    });
  }

  getUserFullDetails(userId: string | number): Observable<any> {
    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '');
    return this.http.get<any>(`${this.baseUrl}/users/${userId}/full-details`, { headers }).pipe(
      map(res => {
        if (res.success && res.data.orderHistory) {
          res.data.orderHistory = this.fixImages(res.data.orderHistory);
        }
        return res;
      })
    );
  }
}