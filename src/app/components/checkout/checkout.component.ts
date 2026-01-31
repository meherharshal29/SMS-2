import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { OrderService } from '../../services/order/order.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService, NgxUiLoaderModule } from 'ngx-ui-loader';
import { FooterComponent } from "../../common/footer/footer.component";
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    NgxUiLoaderModule,
    FooterComponent,
    LoaderComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastrService);
  private loader = inject(NgxUiLoaderService);

  // --- Form Signals ---
  address = signal('');
  city = signal('');
  adharNo = signal('');
  // Added 'cod' and 'net_banking' to match your Service/Backend ENUM
  paymentMethod = signal<'upi' | 'card' | 'net_banking' | 'cod'>('upi');

  // --- State Signals ---
  cartItems = signal<any[]>([]);
  cartSubtotal = signal<number>(0);

  // --- Computed totals ---
  totalAmount = computed(() => this.cartSubtotal());

  ngOnInit() {
    this.loadCheckoutData();
    this.loadUserSuggestions(); // Fetch saved Aadhaar/Address from User model
  }

  /**
   * Fetches the user's previously saved address and Aadhaar
   */
  loadUserSuggestions() {
    this.orderService.getSuggestions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.address.set(res.data.address || '');
          this.city.set(res.data.city || '');
          this.adharNo.set(res.data.adharNo || '');
        }
      },
      error: (err) => console.error('Error fetching suggestions', err)
    });
  }

  /**
   * Loads items currently in the user's cart
   */
  loadCheckoutData() {
    this.cartService.getUserCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cartItems.set(res.data);
          this.cartSubtotal.set(res.cartSubtotal);

          if (res.data.length === 0) {
            this.toast.info('Your cart is empty');
            this.router.navigate(['/rental-all-item']);
          }
        }
      },
      error: () => this.toast.error('Failed to load checkout details')
    });
  }

  /**
   * Validates form and submits the order
   */
  confirmAndPay() {
    // 1. Validation Logic
    if (!this.address().trim() || !this.city().trim()) {
      this.toast.warning('Please provide a complete shipping address');
      return;
    }

    if (this.adharNo().length !== 12 || !/^\d+$/.test(this.adharNo())) {
      this.toast.warning('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    // 2. Start UI Loader
    this.loader.start();

    // 3. Prepare Payload
    const checkoutPayload = {
      address: this.address().trim(),
      city: this.city().trim(),
      adharNo: this.adharNo(),
      paymentMethod: this.paymentMethod()
    };

    // 4. Submit to Backend
    this.orderService.checkout(checkoutPayload).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.success) {
          const successMsg = this.paymentMethod() === 'cod'
            ? 'Order placed! Please keep cash ready for delivery.'
            : 'Rental confirmed! Your gear is reserved.';

          this.toast.success(successMsg);
          this.router.navigate(['/order-history']);
        }
      },
      error: (err) => {
        this.loader.stop();
        const errorMsg = err.error?.message || 'Transaction failed. Please try again.';
        this.toast.error(errorMsg);
      }
    });
  }
}