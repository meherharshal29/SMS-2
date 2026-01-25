import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Booking {
  id: number;
  eventDate: string;
  eventLocation: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  package?: {
    title: string;
    price: number;
    coverImage: string;
  };
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/packages`;

  getMyBookings(): Observable<{ success: boolean; data: Booking[] }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean; data: Booking[] }>(`${this.apiUrl}/my-bookings`, { headers });
  }
}