import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserReview {
  id?: number;
  rating: number;
  comment: string;
  referenceId: number;
  type: 'camera' | 'package' | 'general';
  userId?: number;
  author?: {
    name: string;
    avatar: string;
    role: string;
  };
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user-reviews`;

  /**
   * Helper to attach JWT for user-specific actions
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // --- PUBLIC METHODS ---

  /** Fetch reviews for the homepage slider or product pages */
  getReviewsByItem(referenceId: number, type: string): Observable<ApiResponse<UserReview[]>> {
    return this.http.get<ApiResponse<UserReview[]>>(
      `${this.apiUrl}/filter?referenceId=${referenceId}&type=${type}`
    );
  }

  // --- USER SPECIFIC METHODS (Locked to Logged-in User) ---

  /** Post a new review */
  addReview(review: UserReview): Observable<ApiResponse<UserReview>> {
    return this.http.post<ApiResponse<UserReview>>(
      `${this.apiUrl}/add`,
      review,
      this.getAuthHeaders()
    );
  }

  /** Update user's own review */
  updateReview(id: number, review: Partial<UserReview>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/update/${id}`,
      review,
      this.getAuthHeaders()
    );
  }

  /** Delete user's own review */
  deleteReview(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/delete/${id}`,
      this.getAuthHeaders()
    );
  }

  /** Get all reviews written by the currently logged-in user */
  getMyReviews(): Observable<ApiResponse<UserReview[]>> {
    return this.http.get<ApiResponse<UserReview[]>>(
      `${this.apiUrl}/my-reviews`,
      this.getAuthHeaders()
    );
  }
}