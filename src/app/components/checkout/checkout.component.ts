import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { OrderService, OrderRequest } from '../../services/order/order.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../services/loader/loader.service';
import { LoaderComponent } from "../../components/loader/loader.component";

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastrService);
  public loaderService = inject(LoaderService);

  address = signal('');
  city = signal('');
  adharNo = signal('');
  paymentMethod = signal<'upi' | 'card' | 'netbanking'>('upi');

  subtotal = computed(() => this.cartService.cartSubtotal());
  tax = computed(() => Math.round(this.subtotal() * 0.18));
  totalAmount = computed(() => this.subtotal() + this.tax());

  async confirmAndPay() {
    if (!this.address() || !this.city() || this.adharNo().length !== 12) {
      this.toast.error('Please enter a valid address and 12-digit Aadhaar number', 'Verification Failed', {
        toastClass: 'ngx-toastr custom-toast'
      });
      return;
    }

    const payload: OrderRequest = {
      address: this.address(),
      city: this.city(),
      adhar_no: this.adharNo(),
      payment_method: this.paymentMethod(),
      cartItems: this.cartService.cartItems(),
      total_amount: this.totalAmount()
    };

    this.loaderService.start();

    this.orderService.createOrder(payload).subscribe({
      next: async (res) => {
        await this.loaderService.animateTo100();
        this.loaderService.isSuccess.set(true);

        setTimeout(() => {
          this.loaderService.reset();
          this.cartService.loadCart();
          this.toast.success('Your rental order has been confirmed!', 'Success', {
            toastClass: 'ngx-toastr custom-toast'
          });
          this.router.navigate(['/profile']);
        }, 1500);
      },
      error: (err) => {
        this.loaderService.reset();
        this.toast.error(err.error?.message || 'Payment failed', 'Order Error', {
          toastClass: 'ngx-toastr custom-toast'
        });
      }
    });
  }
}