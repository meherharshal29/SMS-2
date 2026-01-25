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
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  userId: number;
  packageId: number;
  // Note: These keys must match the 'as' aliases in your associations.js
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
    images?: Array<{ url: string }>; // Nested images from PackageImage
  };
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private http = inject(HttpClient);

  /**
   * Helper to build Authorization headers
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  /**
   * Error Handler
   */
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

  /** * Submit a new booking request 
   * @param bookingData { packageId, eventDate, eventLocation, specialRequirements }
   */
  createBooking(bookingData: Partial<Booking>): Observable<{ success: boolean; data: Booking; message: string }> {
    return this.http.post<{ success: boolean; data: Booking; message: string }>(
      `${this.apiUrl}/book`,
      bookingData,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  /** * Get personal booking history for the logged-in client
   */
  getMyBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(
      `${this.apiUrl}/my-bookings`,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  // --- ADMIN OPERATIONS ---

  /** * Fetch all bookings across the platform (Master Dashboard)
   */
  getAllBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(
      `${this.apiUrl}/all`,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  /** * Update the status of a booking (Confirmed, Completed, etc.)
   */
  updateBookingStatus(id: number, status: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/status/${id}`,
      { status },
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  /** * Delete a booking record permanently
   */
  deleteBooking(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }
}