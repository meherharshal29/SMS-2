import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** * Booking Interface aligned with Sequelize Aliases 
 */
export interface Booking {
  id: number;
  eventDate: string;
  eventLocation: string;
  specialRequirements?: string;
  // Standardized Statuses
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'delivered';
  // Added Payment Method for Financial History
  paymentMethod: 'upi' | 'card' | 'net_banking' | 'cod';
  userId: number;
  packageId: number;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    defaultAddress?: string;
    defaultCity?: string;
  };
  package?: {
    id: number;
    title: string;
    price: number;
    coverImage: string;
    images?: Array<{ url: string }>;
  };
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private http = inject(HttpClient);
  private readonly backendUrl = environment.apiUrl.replace('/api', '');

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // --- USER OPERATIONS ---

  createBooking(bookingData: Partial<Booking>): Observable<{ success: boolean; data: Booking; message: string }> {
    return this.http.post<{ success: boolean; data: Booking; message: string }>(
      `${this.apiUrl}/book`,
      bookingData,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  getMyBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(
      `${this.apiUrl}/my-bookings`,
      this.getAuthHeaders()
    ).pipe(
      map(res => {
        if (res.success && res.data) {
          res.data.forEach(b => this.fixBookingImages(b));
        }
        return res;
      }),
      catchError(this.handleError)
    );
  }

  // --- ADMIN OPERATIONS ---

  getAllBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(
      `${this.apiUrl}/all`,
      this.getAuthHeaders()
    ).pipe(
      map(res => {
        if (res.success && res.data) {
          res.data.forEach(b => this.fixBookingImages(b));
        }
        return res;
      }),
      catchError(this.handleError)
    );
  }

  updateBookingStatus(id: number, status: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/status/${id}`,
      { status },
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  deleteBooking(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  // --- HELPERS ---

  private fixBookingImages(booking: Booking): void {
    if (booking.package) {
      if (booking.package.coverImage) {
        booking.package.coverImage = this.formatUrl(booking.package.coverImage);
      }
      if (booking.package.images) {
        booking.package.images.forEach(img => img.url = this.formatUrl(img.url));
      }
    }
  }

  private formatUrl(path: string): string {
    if (!path) return 'assets/placeholder.png';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${this.backendUrl}/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
  }
}