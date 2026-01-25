import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  // --- Reactive State Management ---
  private _cartItems = signal<any[]>([]);

  // Public Read-Only Signals
  public cartItems = computed(() => this._cartItems());
  public cartCount = computed(() => this._cartItems().length);
  public cartSubtotal = computed(() => {
    return this._cartItems().reduce((acc, item) => acc + (item.itemTotal || 0), 0);
  });

  /**
   * Fetches the user's cart from the backend and updates the signal.
   */
  getUserCart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-cart`).pipe(
      tap(res => {
        if (res.success) {
          this._cartItems.set(res.data || []);
        }
      })
    );
  }

  /**
   * Adds an item to the cart and refreshes the cart signal.
   */
  addToCart(cameraId: number, quantity: number = 1, rentalDays: number = 1): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, { cameraId, quantity, rentalDays }).pipe(
      tap(res => {
        if (res.success) {
          this.getUserCart().subscribe();
        }
      })
    );
  }

  /**
   * Updates quantity or rental days for a specific cart item.
   */
  updateCartItem(cartId: number, quantity: number, rentalDays: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${cartId}`, { quantity, rentalDays }).pipe(
      tap(res => {
        if (res.success) {
          this.getUserCart().subscribe();
        }
      })
    );
  }

  /**
   * Removes a single item from the cart signal and backend.
   */
  removeFromCart(cartId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/remove/${cartId}`).pipe(
      tap(res => {
        if (res.success) {
          this._cartItems.update(items => items.filter(item => item.id !== cartId));
        }
      })
    );
  }

  clearCartSignal(): void {
    this._cartItems.set([]);
  }

  /**
   * Finalizes the checkout process.
   */
  checkout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/checkout`, {}).pipe(
      tap(res => {
        if (res.success) {
          this.clearCartSignal();
        }
      })
    );
  }
}