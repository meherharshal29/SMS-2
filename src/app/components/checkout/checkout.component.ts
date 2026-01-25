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
  imports: [CommonModule, FormsModule, DecimalPipe, NgxUiLoaderModule, FooterComponent, LoaderComponent],
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
  paymentMethod = signal<'upi' | 'card' | 'netbanking'>('upi');

  // --- State Signals ---
  cartItems = signal<any[]>([]);
  cartSubtotal = signal<number>(0);

  // --- Computed totals (GST Removed - Price is inclusive) ---
  totalAmount = computed(() => this.cartSubtotal());

  ngOnInit() {
    this.loadCheckoutData();
    this.loadUserSuggestions(); // Fetch saved Aadhaar/Address
  }

  loadUserSuggestions() {
    this.orderService.getSuggestions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.address.set(res.data.address || '');
          this.city.set(res.data.city || '');
          this.adharNo.set(res.data.adharNo || '');
        }
      }
    });
  }

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

  confirmAndPay() {
    if (!this.address() || !this.city()) {
      this.toast.warning('Please provide shipping details');
      return;
    }

    if (this.adharNo().length !== 12 || !/^\d+$/.test(this.adharNo())) {
      this.toast.warning('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    this.loader.start();

    const checkoutPayload = {
      address: this.address(),
      city: this.city(),
      adharNo: this.adharNo(),
      paymentMethod: this.paymentMethod()
    };

    this.orderService.checkout(checkoutPayload).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.success) {
          this.toast.success('Rental confirmed! Gear reserved.');
          this.router.navigate(['/order-history']);
        }
      },
      error: (err) => {
        this.loader.stop();
        this.toast.error(err.error?.message || 'Transaction failed');
      }
    });
  }
}