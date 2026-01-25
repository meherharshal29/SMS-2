import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CallRequestPayload {
  subject: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/messages`; // Adjust based on your routes

  /**
   * Sends a request for a callback.
   * Since the user is logged in, the backend will extract Name and Phone 
   * from the database using the JWT token.
   */
  requestCallback(payload: CallRequestPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-call`, payload);
  }

  /**
   * General contact message (for non-callback inquiries)
   */
  sendGeneralInquiry(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, data);
  }
}