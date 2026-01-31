import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartService } from '../cart/cart.service';

// --- Interfaces ---

export interface Order {
  id: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'returned' | 'cancelled' | 'cancel';
  paymentMethod: 'upi' | 'card' | 'net_banking' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  rentalStartDate: string;
  rentalEndDate: string;
  quantity: number;
  shippingAddress: string;
  adharNumber: string;
  createdAt: string;
  Camera: {
    id: number;
    name: string;
    brand: string;
    modelNumber: string;
    pricePerDay: number;
    images: { url: string }[];
  };
}

export interface CheckoutSuggestions {
  address: string;
  city: string;
  adharNo: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private cartService = inject(CartService);

  private readonly apiUrl = `${environment.apiUrl}/orders`;
  private readonly backendUrl = environment.apiUrl.replace('/api', ''); // Derives base URL for images

  /**
   * SUGGESTIONS: Pre-fill checkout with saved profile data
   */
  getSuggestions(): Observable<ApiResponse<CheckoutSuggestions>> {
    return this.http.get<ApiResponse<CheckoutSuggestions>>(`${this.apiUrl}/suggestions`);
  }

  /**
   * CHECKOUT: Submit order and clear local cart signal
   */
  checkout(checkoutData: any): Observable<ApiResponse<Order[]>> {
    return this.http.post<ApiResponse<Order[]>>(`${this.apiUrl}/checkout`, checkoutData).pipe(
      tap(res => {
        if (res.success) {
          this.cartService.clearCartSignal();
        }
      })
    );
  }

  /**
   * HISTORY: Get orders for the logged-in user
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/my-orders`).pipe(
      map(res => {
        if (res.success && res.data) {
          res.data.forEach(order => this.fixOrderImages(order));
          return res.data;
        }
        return [];
      })
    );
  }

  /**
   * DETAILS: Get a single order by ID
   */
  getOrderById(id: string | number): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        if (res.success) {
          this.fixOrderImages(res.data);
          return res.data;
        }
        throw new Error(res.message || 'Order not found');
      })
    );
  }

  /**
   * ADMIN: Update order status (e.g., Shipped -> Delivered)
   */
  updateStatus(orderId: number, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/status/${orderId}`, { status });
  }

  /**
   * --- HELPERS ---
   */

  private fixOrderImages(order: Order): void {
    if (order.Camera && order.Camera.images) {
      order.Camera.images.forEach(img => {
        img.url = this.getFormattedImageUrl(img.url);
      });
    }
  }

  private getFormattedImageUrl(relativePath: string): string {
    if (!relativePath) return 'https://placehold.co/400x400?text=No+Image';
    if (relativePath.startsWith('http')) return relativePath;

    const cleanPath = relativePath.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
    return `${this.backendUrl}/${finalPath}`;
  }

  /**
   * UI HELPER: Maps status to CSS classes for badges
   */
  getStatusBadgeClass(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'badge bg-warning text-dark',
      'confirmed': 'badge bg-info text-white',
      'shipped': 'badge bg-primary text-white',
      'delivered': 'badge bg-success text-white',
      'returned': 'badge bg-dark text-white',
      'cancelled': 'badge bg-danger text-white',
      'cancel': 'badge bg-danger text-white'
    };
    return statusMap[status] || 'badge bg-secondary';
  }

  /**
   * UI HELPER: Maps payment method to readable labels
   */
  getPaymentMethodLabel(method: string): string {
    const methods: Record<string, string> = {
      'upi': 'UPI / QR Code',
      'card': 'Credit/Debit Card',
      'net_banking': 'Net Banking',
      'cod': 'Cash on Delivery'
    };
    return methods[method] || method.toUpperCase();
  }
}