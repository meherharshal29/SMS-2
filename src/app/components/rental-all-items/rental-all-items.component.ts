import { Component, OnInit, inject, signal, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, DecimalPipe, UpperCasePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CameraService } from '../../services/camera/camera.service';
import { CartService } from '../../services/cart/cart.service';
import { FooterComponent } from "../../common/footer/footer.component";
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-rental-all-items',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent,
    NgxUiLoaderModule,
    DecimalPipe,
    UpperCasePipe
  ],
  templateUrl: './rental-all-items.component.html',
  styleUrl: './rental-all-items.component.scss'
})
export class RentalAllItemsComponent implements OnInit, OnDestroy {
  // Services
  private cameraService = inject(CameraService);
  private cartService = inject(CartService);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);

  // Signals for Reactive State
  rentals = signal<any[]>([]);
  categories = signal<any[]>([]);
  selectedCategory = signal<number | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    // Scroll to top on load (SSR Safe)
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.fetchCategories();
    this.loadGear();
  }

  /**
   * Fetches available categories for filtering
   */
  fetchCategories(): void {
    this.cameraService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories.set(res.data);
      }
    });
  }

  /**
   * Fetches gear with Skeleton Loader logic
   */
  loadGear(categoryId: number | null = null): void {
    this.isLoading.set(true);
    this.selectedCategory.set(categoryId);

    // If changing category, scroll back to top of catalog
    if (isPlatformBrowser(this.platformId)) {
      const catalogHeader = document.querySelector('.rental-catalog');
      catalogHeader?.scrollIntoView({ behavior: 'smooth' });
    }

    const params: any = { limit: 20 };
    if (categoryId) params.categoryId = categoryId;

    this.cameraService.getAllCameras(params).pipe(
      finalize(() => {
        this.isLoading.set(false);
        // Note: We don't use this.loader.start() here because we have Skeletons
      })
    ).subscribe({
      next: (response) => {
        if (response?.success) {
          this.rentals.set(response.data || []);
        }
      },
      error: () => {
        this.toastr.error('Failed to load gear collection.', 'Error');
      }
    });
  }

  /**
   * Image logic: Finds primary or returns first available
   */
  getPrimaryImage(item: any): string {
    if (item?.images?.length > 0) {
      const primary = item.images.find((img: any) => img.isPrimary);
      return primary ? primary.url : item.images[0].url;
    }
    return 'assets/no-camera.png';
  }

  /**
   * Adds item to cart with NgxUiLoader (Global blocking)
   */
  onAddToCart(event: Event, item: any): void {
    event.stopPropagation();

    this.loader.start(); // Start global spinner to prevent double-clicks

    this.cartService.addToCart(item.id, 1, 1).pipe(
      finalize(() => this.loader.stop())
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`${item.name} added to cart!`);
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Error adding to cart';
        this.toastr.error(errorMsg);
      }
    });
  }

  onWishlist(event: Event, item: any): void {
    event.stopPropagation();
    this.toastr.info('Saved to wishlist!', item.name);
  }

  /**
   * Safety cleanup
   */
  ngOnDestroy(): void {
    this.loader.stopAll();
  }
}