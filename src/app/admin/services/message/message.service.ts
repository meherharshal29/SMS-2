// src/app/services/message.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// src/app/models/message.model.ts
export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
}
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:5000/api/messages'; // Adjust to your backend URL

  constructor(private http: HttpClient) { }

  // Submit a new message (Public - no auth needed)
  submitMessage(messageData: { name: string; email: string; subject: string; message: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/submit`, messageData).pipe(
      catchError(this.handleError)
    );
  }

  // Get all messages (Admin only)
  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/all`).pipe(
      catchError(this.handleError)
    );
  }

  // Mark message as read (Admin only)
  markAsRead(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/read/${id}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Reply to a message (Admin only)
  replyToMessage(id: number, replyData: { replyMessage: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reply/${id}`, replyData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized: Please log in as admin.';
          break;
        case 403:
          errorMessage = 'Forbidden: Admin privileges required.';
          break;
        case 404:
          errorMessage = 'Not found.';
          break;
        case 500:
          errorMessage = 'Server error. Try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}