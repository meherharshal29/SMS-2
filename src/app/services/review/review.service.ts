import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces ---
export interface Review {
  id?: number;
  cameraId: number;
  userId?: number;
  rating: number;
  comment: string;
  createdAt?: string;
  user?: {
    name: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  /**
   * Helper: Generate Headers with User Token
   * This ensures the 'protect' middleware on the backend can verify the user.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Use 'adminToken' if admin is reviewing
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * 1. GET ALL REVIEWS (Public)
   * Fetches the list of reviews for a specific camera.
   */
  getCameraReviews(cameraId: number): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/${cameraId}`);
  }

  /**
   * 2. ADD REVIEW (Protected)
   * Requires the user to have rented the camera.
   */
  addReview(reviewData: Review): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(
      `${this.apiUrl}/add`,
      reviewData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * 3. UPDATE REVIEW (Protected)
   * Allows the author to update their rating or comment.
   */
  updateReview(reviewId: number, updateData: Partial<Review>): Observable<ApiResponse<Review>> {
    return this.http.put<ApiResponse<Review>>(
      `${this.apiUrl}/update/${reviewId}`,
      updateData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * 4. DELETE REVIEW (Protected)
   * Allows the author to remove their review.
   */
  deleteReview(reviewId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/delete/${reviewId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Add this helper to your existing ReviewService
  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id; // Ensure your backend token includes 'id'
    } catch (e) {
      return null;
    }
  }
}