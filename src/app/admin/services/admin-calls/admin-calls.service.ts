import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CallRequest {
  id: number;
  name: string;
  phone: string;
  subject: string;
  status: 'Pending' | 'Called' | 'Cancelled';
  createdAt: string;
  user?: {
    email: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminCallsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/call-requests`;

  /**
   * Fetch all callback requests
   */
  getCallRequests(): Observable<{ success: boolean; data: CallRequest[] }> {
    return this.http.get<{ success: boolean; data: CallRequest[] }>(this.apiUrl);
  }

  /**
   * Update the status of a specific call
   */
  updateCallStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }
}