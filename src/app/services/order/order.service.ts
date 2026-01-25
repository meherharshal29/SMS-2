import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartService } from '../cart/cart.service';

// --- Interfaces ---

export interface Order {
  id: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'returned' | 'cancelled';
  rentalStartDate: string;
  rentalEndDate: string;
  quantity: number;
  shippingAddress: string;
  adharNumber: string;
  paymentMethod: string;
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

  // Ensure this matches your CameraService backend URL to load images properly
  private readonly backendUrl = 'http://localhost:5000';

  /**
   * SUGGESTIONS: Pre-fill the checkout form using saved User Profile data.
   */
  getSuggestions(): Observable<ApiResponse<CheckoutSuggestions>> {
    return this.http.get<ApiResponse<CheckoutSuggestions>>(`${this.apiUrl}/suggestions`);
  }

  /**
   * CHECKOUT: Submits order and clears the Cart Signal upon success.
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
   * HISTORY: Fetches user orders and fixes image URLs for display.
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/my-orders`).pipe(
      map(res => {
        if (res.success && res.data) {
          // Fix image paths for every order in the list
          res.data.forEach(order => this.fixOrderImages(order));
          return res.data;
        }
        return [];
      })
    );
  }

  /**
   * DETAILS: Get specific order by ID and fix its images.
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
   * UI HELPER: Maps status to Bootstrap/Tailwind badge classes
   */
  getStatusBadgeClass(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'badge bg-warning text-dark',
      'confirmed': 'badge bg-info text-white',
      'shipped': 'badge bg-primary text-white',
      'returned': 'badge bg-success text-white',
      'cancelled': 'badge bg-danger text-white'
    };
    return statusMap[status] || 'badge bg-secondary';
  }
}