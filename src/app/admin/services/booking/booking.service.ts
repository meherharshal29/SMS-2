import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Booking Interface matching your Sequelize associations (User & Package)
 */
export interface Booking {
  id: number;
  eventDate: string;
  eventLocation: string;
  specialRequirements?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  userId: number;
  packageId: number;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  package?: {
    title: string;
    price: number;
    coverImage: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/packages`;

  /**
   * Helper: Generates Auth Headers
   * Vital for preventing 401 Unauthorized errors
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // ==========================================
  // ADMIN OPERATIONS
  // ==========================================

  /** * GET /api/packages/admin/bookings/all 
   */
  getAllBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(
      `${this.apiUrl}/admin/bookings/all`,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  /** * PATCH /api/packages/admin/bookings/:id/status 
   * Specifically uses PATCH to satisfy CORS preflight logic
   */
  updateBookingStatus(id: number, status: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/admin/bookings/${id}/status`,
      { status },
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  /** * DELETE /api/packages/:id 
   */
  deleteBooking(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  // ==========================================
  // USER OPERATIONS
  // ==========================================

  /** * POST /api/packages/book 
   */
  createBooking(bookingData: Partial<Booking>): Observable<{ success: boolean; data: Booking }> {
    return this.http.post<{ success: boolean; data: Booking }>(
      `${this.apiUrl}/book`,
      bookingData,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  /** * GET /api/packages/my-bookings 
   */
  getMyBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(
      `${this.apiUrl}/my-bookings`,
      this.getAuthHeaders()
    ).pipe(
      retry(1), // Retries once on transient network failure
      catchError(this.handleError)
    );
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Session expired. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access Denied: Admin permissions required.';
          break;
        case 0:
          errorMessage = 'CORS Error or Server Unreachable. Check PATCH method settings.';
          break;
        default:
          errorMessage = error.error?.message || `Server Error: ${error.status}`;
      }
    }

    console.error(`[BookingService] ${errorMessage}`, error);
    return throwError(() => new Error(errorMessage));
  }
}