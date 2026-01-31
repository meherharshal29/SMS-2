// src/app/admin/services/hero/hero.service.ts
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class HeroService {
  private http = inject(HttpClient);
  private readonly apiUrl = `http://localhost:5000/api/admin/hero`;

  // Public fetch (No Auth Headers)
  getHeroImages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';

    if (error.status === 0) {
      errorMessage = 'Cannot connect to backend server. Check port 5000.';
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'Not authorized: Access Denied.';
    } else if (error.status === 404) {
      errorMessage = 'API Route not found (404).';
    } else {
      // Extract specific message from backend if available
      errorMessage = error.error?.message || error.statusText || errorMessage;
    }

    console.error('HeroService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}