import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private http = inject(HttpClient);

  // Ensure this URL matches your backend route exactly
  private readonly apiUrl = `${environment.apiUrl}/newsletter`;

  /**
   * Helper: Generate Headers with Admin Token
   * Resolves 403 Forbidden by ensuring the JWT is attached.
   */
  private getAuthHeaders(): HttpHeaders {
    // 1. Retrieve the token (Ensure key name matches your login component)
    const token = localStorage.getItem('adminToken');

    // 2. Log a warning if token is missing (useful for debugging)
    if (!token) {
      console.warn("NewsletterService: No adminToken found in localStorage.");
    }

    // 3. Return headers with Bearer format
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Send Newsletter to ALL Users
   * Uses FormData for Title, Body, Links, and 3 Images
   */
  sendToAll(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/all`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Send Test Newsletter to a Single Email
   */
  sendToSingle(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/single`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get Newsletter Log History
   */
  getHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a History Record
   */
  deleteLog(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Global Error Handler to catch 403 and other HTTP errors
   */
  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    if (error.status === 403) {
      errorMessage = 'Access Denied: You do not have Admin permissions or your session expired.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}