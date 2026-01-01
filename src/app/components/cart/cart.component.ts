import { Component, OnInit, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart/cart.service';
import { CameraService } from '../../services/camera/camera.service';
import { FooterComponent } from "../../common/footer/footer.component";
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, FooterComponent, NgxUiLoaderModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  public cartService = inject(CartService);
  private cameraService = inject(CameraService);
  private router = inject(Router);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);

  suggestedGears = signal<any[]>([]);

  // Computed totals for the summary card
  securityDeposit = computed(() => Math.round(this.cartService.cartSubtotal() * 0.2));
  finalTotalDue = computed(() => this.cartService.cartSubtotal() + this.securityDeposit());

  constructor() {
    effect(() => {
      // Accessing cartItems() ensures this effect runs whenever the cart is updated
      if (this.cartService.cartItems().length >= 0) {
        this.loadSuggestions();
      }
    });
  }

  ngOnInit() {
    this.cartService.loadCart();
  }

  loadSuggestions() {
    this.cameraService.getAllCameras().subscribe({
      next: (data) => {
        const cartCameraIds = this.cartService.cartItems().map(i => i.camera_id);
        // Filter out items already in the cart and show only first 3
        this.suggestedGears.set(
          data.filter((c: any) => !cartCameraIds.includes(c.id)).slice(0, 3)
        );
      },
      error: () => console.error('Could not load suggestions')
    });
  }

  changeQuantity(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty >= 1) {
      this.loader.start();
      this.cartService.updateQuantity(item.cart_id, newQty).subscribe({
        next: () => {
          setTimeout(() => this.loader.stop(), 500);
          this.toastr.success('Quantity updated', 'Cart Update', {
            toastClass: 'ngx-toastr custom-toast'
          });
        },
        error: () => this.loader.stop()
      });
    } else {
      this.removeItem(item.cart_id, item.model_name);
    }
  }

  removeItem(cartId: number, modelName?: string) {
    if (confirm(`Remove ${modelName || 'this gear'} from your project?`)) {
      this.loader.start();
      this.cartService.removeFromCart(cartId).subscribe({
        next: () => {
          setTimeout(() => this.loader.stop(), 800);
          this.toastr.warning('Gear removed from project', 'Removed', {
            toastClass: 'ngx-toastr custom-toast'
          });
        },
        error: () => this.loader.stop()
      });
    }
  }

  quickAdd(item: any) {
    this.loader.start();
    this.cartService.addToCart(item.id, 1).subscribe({
      next: () => {
        this.loader.stop();
        this.toastr.success(`${item.model_name} added!`, 'Success', {
          toastClass: 'ngx-toastr custom-toast'
        });
      },
      error: () => this.loader.stop()
    });
  }

  /**
   * FIXED: Navigate to Checkout page instead of direct payment
   */
  onProceedToPayment() {
    if (this.cartService.cartItems().length === 0) {
      this.toastr.error("Your cart is empty!", "Checkout Error");
      return;
    }

    // Redirect to the checkout page where the user enters Aadhaar/Address
    this.router.navigate(['/checkout']);
  }

  ngOnDestroy() {
    this.loader.stopAll();
  }
}