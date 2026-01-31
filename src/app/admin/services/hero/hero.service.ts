import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private http = inject(HttpClient);

  // Use environment variable for the base URL
  private readonly apiUrl = `${environment.apiUrl}/admin/hero`;

  /**
   * Helper: Generate Headers with Admin Token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.warn("HeroService: No adminToken found in localStorage.");
    }
    // Clean token from quotes if they exist
    const cleanToken = token?.replace(/['"]+/g, '').trim();

    return new HttpHeaders({
      'Authorization': `Bearer ${cleanToken}`
    });
  }

  /**
   * Upload up to 10 images at once
   */
  uploadHeroImages(files: File[], column: string): Observable<any> {
    const formData = new FormData();

    // Append all files to the 'images' key
    files.forEach(file => {
      formData.append('images', file);
    });

    formData.append('columnType', column);
    formData.append('altText', 'Professional Studio Capture');

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getHeroImages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    if (error.status === 0) {
      errorMessage = 'Backend server is not reachable. Check if your Node.js server is running on port 3000.';
    } else if (error.status === 403) {
      errorMessage = 'Access Denied: Admin privileges required.';
    }
    return throwError(() => new Error(errorMessage));
  }
}