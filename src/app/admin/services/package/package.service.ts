import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/packages`;
  private http = inject(HttpClient);

  /**
   * Helper: Get headers with either Admin or User token
   */
  private getAuthHeaders() {
    // Try adminToken first, fallback to user token
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // ==========================================
  // PUBLIC METHODS
  // ==========================================

  getAllPackages(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getPackageById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================================
  // USER PROTECTED METHODS
  // ==========================================

  /**
   * Standard booking for a photography session
   */
  bookPackage(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, bookingData, this.getAuthHeaders());
  }

  // ==========================================
  // ADMIN PROTECTED METHODS
  // ==========================================

  createPackage(data: FormData): Observable<any> {
    // Note: Don't set 'Content-Type' manually when sending FormData; 
    // the browser needs to set the boundary automatically.
    return this.http.post(`${this.apiUrl}/create`, data, this.getAuthHeaders());
  }

  updatePackage(id: string | number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getAuthHeaders());
  }

  /**
   * Proper deletion of a single image from Cloudinary & Database
   * URL matches: /api/packages/images/:imageId
   */
  deletePackageImage(imageId: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/images/${imageId}`, this.getAuthHeaders());
  }

  deletePackage(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  /**
   * Fetch all bookings for the Admin Dashboard
   */
  getAdminBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/bookings/all`, this.getAuthHeaders());
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}