// services/cart/cart.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CartItem {
  cart_id: number;
  camera_id: number;
  quantity: number;
  brand: string;
  model_name: string;
  price_per_day: number;
  thumbnail: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/cart';

  // State management using Signals
  cartItems = signal<CartItem[]>([]);

  // Computed value: Automatically recalculates when cartItems change
  cartSubtotal = computed(() =>
    this.cartItems().reduce((acc, item) => acc + (Number(item.price_per_day) * item.quantity), 0)
  );

  loadCart(): void {
    // Note: HttpInterceptor should handle the Authorization header
    this.http.get<CartItem[]>(this.apiUrl).subscribe({
      next: (data) => this.cartItems.set(data),
      error: (err) => {
        console.error('Cart Load Error:', err);
        this.cartItems.set([]); // Clear cart on error (e.g. expired token)
      }
    });
  }

  addToCart(camera_id: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { camera_id, quantity }).pipe(
      tap(() => this.loadCart()) // Refresh signal after adding
    );
  }

  updateQuantity(cartId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-qty`, { cart_id: cartId, quantity }).pipe(
      tap(() => this.loadCart()) // Refresh signal after update
    );
  }

  removeFromCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartId}`).pipe(
      tap(() => this.loadCart()) // Refresh signal after removal
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`).pipe(
      tap(() => this.cartItems.set([]))
    );
  }
}