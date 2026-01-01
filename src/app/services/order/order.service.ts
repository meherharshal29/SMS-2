import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface OrderRequest {
  address: string;
  city: string;
  adhar_no: string;
  payment_method: 'upi' | 'card' | 'netbanking';
  cartItems: any[];
  total_amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/orders';

  // Signal to store order history globally if needed
  public orderHistory = signal<any[]>([]);

  /**
   * logic: Send checkout data to backend to create a new order
   */
  createOrder(orderData: OrderRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/create`, orderData);
  }

  /**
   * logic: Fetch all past orders for the logged-in user
   * Updates the orderHistory signal automatically
   */
  fetchMyOrders(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/my-history`).pipe(
      tap((res) => {
        if (res.success) {
          this.orderHistory.set(res.orders);
        }
      })
    );
  }

  /**
   * logic: Get details for a single specific order
   */
  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${orderId}`);
  }
}