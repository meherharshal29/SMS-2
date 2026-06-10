import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
    RouterModule,
    DecimalPipe,
    NgxUiLoaderModule,
    FooterComponent,
    LoaderComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastrService);
  private loader = inject(NgxUiLoaderService);

  // --- Form Signals ---
  address = signal('');
  city = signal('');
  adharNo = signal('');
  paymentMethod = signal<'upi' | 'card' | 'net_banking' | 'cod'>('cod'); // Defaulted to active 'cod' selector

  // --- State Signals ---
  cartItems = signal<any[]>([]);
  cartSubtotal = signal<number>(0);

  // Fulfillment method synced from local storage context
  fulfillmentMethod = signal<'pickup' | 'delivery'>('pickup');

  // Computed delivery pricing metrics
  deliveryCharge = computed(() => this.fulfillmentMethod() === 'delivery' ? 100 : 0);

  // Auto-calculated grand final amount due
  totalAmount = computed(() => this.cartSubtotal() + this.deliveryCharge());

  ngOnInit() {
    this.detectFulfillmentPreference();
    this.loadCheckoutData();
    this.loadUserSuggestions();
  }

  /**
   * Reads validation state choices saved from the cart view process
   */
  private detectFulfillmentPreference() {
    const savedMethod = localStorage.getItem('selectedFulfillment');
    if (savedMethod === 'delivery' || savedMethod === 'pickup') {
      this.fulfillmentMethod.set(savedMethod);
    }
  }

  /**
   * Fetches the user's previously saved profiles
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
   * Loads active item rows contained within the checkout bounds
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
   * Direct manual toggle configuration if a client prefers changes directly inside checkout
   */
  changeFulfillmentMethod(method: 'pickup' | 'delivery') {
    this.fulfillmentMethod.set(method);
    localStorage.setItem('selectedFulfillment', method);
  }

  /**
   * Performs form verification checks and transfers order payloads
   */
  confirmAndPay() {
    // 1. Validate Aadhaar Identification Field
    if (!this.adharNo() || !this.adharNo().trim()) {
      this.toast.warning('Aadhaar Card Number is required');
      return;
    }
    if (this.adharNo().trim().length !== 12 || !/^\d+$/.test(this.adharNo().trim())) {
      this.toast.warning('Please enter a valid 12-digit Aadhaar identification card string');
      return;
    }

    // 2. Validate City Field
    if (!this.city() || !this.city().trim()) {
      this.toast.warning('City selection field is required');
      return;
    }

    // 3. Validate Address Field
    if (!this.address() || !this.address().trim()) {
      this.toast.warning('Please provide a complete destination or billing address profile');
      return;
    }

    // 4. Validate Payment Method Selection
    if (!this.paymentMethod()) {
      this.toast.warning('Please select a secure payment mode to proceed');
      return;
    }

    this.loader.start();

    const checkoutPayload = {
      address: this.address().trim(),
      city: this.city().trim(),
      adharNo: this.adharNo().trim(),
      paymentMethod: this.paymentMethod(),
      fulfillmentMethod: this.fulfillmentMethod(),
      deliveryCharge: this.deliveryCharge()
    };

    this.orderService.checkout(checkoutPayload).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.success) {
          const successMsg = this.paymentMethod() === 'cod'
            ? 'Order placed! Please ensure full digital payment clearance is provided before product receiving.'
            : 'Rental confirmed! Your gear allocation reservation is successful.';

          this.toast.success(successMsg);
          localStorage.removeItem('selectedFulfillment'); // Clean transactional cache safely
          this.router.navigate(['/order-history']);
        }
      },
      error: (err) => {
        this.loader.stop();
        const errorMsg = err.error?.message || 'Transaction processing failed. Please verify credentials.';
        this.toast.error(errorMsg);
      }
    });
  }

  ngOnDestroy() {
    this.loader.stopAll();
  }
}