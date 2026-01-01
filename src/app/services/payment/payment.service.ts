import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Singleton available everywhere
})
export class PaymentService {
  private http = inject(HttpClient); // Modern injection in Angular 19
  private baseUrl = 'http://localhost:5000/api/payment'; // Your Node.js URL

  // Initiates the payment and gets the redirect URL
  initiatePayment(paymentData: { amount: number; transactionId: string; userId: string }): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/initiate`, paymentData);
  }

  // Verifies payment status after redirection
  verifyStatus(txnId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/validate/${txnId}`);
  }
}