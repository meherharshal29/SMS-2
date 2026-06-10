import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// --- Interfaces ---

export interface PackageImage {
  id: number;
  url: string;
}

export interface Package {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;

  // Media
  coverImage: string;       // Main thumbnail
  images: PackageImage[];   // Gallery images (Safe array)

  // Features / Booleans
  includesDrone?: boolean;
  includesCandid?: boolean;
  includesCinematicVideo?: boolean;
  includesTraditionalVideo?: boolean;

  // Arrays (JSON fields)
  features?: string[];
  deliverables?: string[];

  // System
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Matches your Backend Response: { success: true, data: ... }
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  // Update this port if your backend runs on 3000 or 8080
  private apiUrl = `${environment.apiUrl}/packages`;;

  constructor(private http: HttpClient) { }

  /**
   * GET ALL PACKAGES
   * Fetches the list and ensures 'images' is always an array.
   */
  getActivePackages(category?: string): Observable<Package[]> {
    let params = new HttpParams();
    if (category && category !== 'All') {
      params = params.set('category', category);
    }

    return this.http.get<ApiResponse<Package[]>>(this.apiUrl, { params })
      .pipe(
        map(response => {
          // 1. Unwrap the 'data' property
          const packages = response.data;

          // 2. Safety Check: If 'images' is null/undefined, make it []
          return packages.map(pkg => ({
            ...pkg,
            images: pkg.images || []
          }));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * GET SINGLE PACKAGE BY ID
   * Fetches details + full gallery.
   */
  getPackageById(id: string | number): Observable<Package> {
    return this.http.get<ApiResponse<Package>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          const pkg = response.data;

          // Safety Check: Ensure 'images' array exists
          return {
            ...pkg,
            images: pkg.images || []
          };
        }),
        catchError(this.handleError)
      );
  }

  bookPackage(bookingData: any): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('token'); // Use your specific auth token key
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/book`, bookingData, { headers })
      .pipe(catchError(this.handleError));
  }



  // --- Error Handling Helper ---
  private handleError(error: any) {
    let errorMessage = 'Unknown Server Error';

    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('PackageService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}