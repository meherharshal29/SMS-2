import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

import { CameraService } from '../../services/camera/camera.service';
import { CartService } from '../../services/cart/cart.service';

import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

interface RentalItem {
  id: number;
  brand: string;
  model_name: string;
  price_per_day: number;
  original_price?: number;
  discount?: number;
  images: string[];
}

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterModule,
    NgxUiLoaderModule
  ],
  templateUrl: './rental.component.html',
  styleUrl: './rental.component.scss'
})
export class RentalComponent implements OnInit, OnDestroy {

  private cameraService = inject(CameraService);
  private cartService = inject(CartService);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  private routerSub!: Subscription;

  rentals = signal<RentalItem[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchData();

    // 🔥 IMPORTANT: Stop loader on route change (back / navigation)
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loader.stopAll();
      }
    });
  }

  fetchData(): void {
    this.isLoading.set(true);

    this.cameraService.getAllCameras().subscribe({
      next: (data: any[]) => {
        const transformed: RentalItem[] = data.map(item => ({
          id: item.id,
          brand: item.brand,
          model_name: item.model_name,
          price_per_day: item.price_per_day,
          original_price: item.original_price,
          discount: item.discount,
          images: Array.isArray(item.images)
            ? item.images.map((img: any) => img.image_url)
            : []
        }));

        this.rentals.set(transformed);
        this.error.set(null);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load gear.');
        this.isLoading.set(false);
        this.toastr.error('Could not fetch rental items', 'Network Error');
      }
    });
  }

  onAddToCart(event: Event, item: RentalItem): void {
    event.stopPropagation();

    // ✅ Loader only for button action
    this.loader.start();

    this.cartService.addToCart(item.id, 1).subscribe({
      next: () => {
        setTimeout(() => {
          this.loader.stop();
          this.toastr.success(
            `${item.model_name} added to cart!`,
            'Success',
            {
              toastClass: 'ngx-toastr custom-toast',
              positionClass: 'toast-top-right'
            }
          );
        }, 1000);
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to add item to cart', 'Error');
      }
    });
  }

  onWishlist(event: Event, item: RentalItem): void {
    event.stopPropagation();
    this.toastr.info(
      'Saved to your wishlist!',
      item.model_name,
      { toastClass: 'ngx-toastr custom-toast' }
    );
  }

  ngOnDestroy(): void {
    // 🧹 Final safety cleanup
    this.loader.stopAll();
    this.routerSub?.unsubscribe();
  }
}
