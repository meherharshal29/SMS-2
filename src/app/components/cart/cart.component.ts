import { Component, OnInit, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
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
  cartItems = signal<any[]>([]);
  subtotal = signal<number>(0);

  securityDeposit = computed(() => Math.round(this.subtotal() * 0.2));
  finalTotalDue = computed(() => this.subtotal() + this.securityDeposit());

  constructor() {
    effect(() => {
      if (this.cartItems().length >= 0) {
        this.loadSuggestions();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadCartData();
  }

  loadCartData() {
    this.cartService.getUserCart().subscribe({
      next: (res) => {
        if (res.success) {
          // FIX: Process image URLs for cart items
          const processedItems = res.data.map((item: any) => {
            if (item.Camera?.images) {
              item.Camera.images = item.Camera.images.map((img: any) => ({
                ...img,
                url: this.cameraService.getPrivateImageUrl(img.url)
              }));
            }
            return item;
          });

          this.cartItems.set(processedItems);
          this.subtotal.set(res.cartSubtotal);
        }
      },
      error: () => this.toastr.error('Failed to load cart')
    });
  }

  loadSuggestions() {
    this.cameraService.getAllCameras().subscribe({
      next: (res) => {
        if (res.success) {
          const cartCameraIds = this.cartItems().map(i => i.cameraId);

          // FIX: Process image URLs for suggested items
          const filtered = res.data
            .filter((c: any) => !cartCameraIds.includes(c.id))
            .slice(0, 3)
            .map((camera: any) => {
              if (camera.images) {
                camera.images = camera.images.map((img: any) => ({
                  ...img,
                  url: this.cameraService.getPrivateImageUrl(img.url)
                }));
              }
              return camera;
            });

          this.suggestedGears.set(filtered);
        }
      },
      error: () => console.error('Could not load suggestions')
    });
  }

  changeQuantity(item: any, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty >= 1) {
      this.loader.start();
      this.cartService.updateCartItem(item.id, newQty, item.rentalDays).subscribe({
        next: () => {
          this.loadCartData();
          this.loader.stop();
          this.toastr.success('Quantity updated');
        },
        error: () => this.loader.stop()
      });
    } else {
      this.removeItem(item.id, item.Camera?.name);
    }
  }

  removeItem(cartId: number, modelName?: string) {
    if (confirm(`Remove ${modelName || 'this gear'} from your project?`)) {
      this.loader.start();
      this.cartService.removeFromCart(cartId).subscribe({
        next: () => {
          this.loadCartData();
          this.loader.stop();
          this.toastr.warning('Gear removed');
        },
        error: () => this.loader.stop()
      });
    }
  }

  quickAdd(item: any) {
    this.loader.start();
    this.cartService.addToCart(item.id, 1, 1).subscribe({
      next: () => {
        this.loadCartData();
        this.loader.stop();
        this.toastr.success(`${item.name} added!`);
      },
      error: () => this.loader.stop()
    });
  }

  onProceedToPayment() {
    if (this.cartItems().length === 0) {
      this.toastr.error("Your cart is empty!");
      return;
    }
    this.router.navigate(['/checkout']);
  }

  ngOnDestroy() {
    this.loader.stopAll();
  }
}