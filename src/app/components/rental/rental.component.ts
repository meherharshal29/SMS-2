import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { CameraService, Camera } from '../../services/camera/camera.service';
import { CartService } from '../../services/cart/cart.service';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { Category } from '../../admin/services/camera/camera.service';

// Extended Interface to match the template requirements
interface RentalItem extends Camera {
  isWishlisted: any;
  discount?: number;
  original_price?: number;
  avgRating?: number;
  totalReviews?: number;
}

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule, NgxUiLoaderModule],
  templateUrl: './rental.component.html',
  styleUrl: './rental.component.scss'
})
export class RentalComponent implements OnInit {
  // --- Dependency Injection ---
  private cameraService = inject(CameraService);
  private cartService = inject(CartService);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // --- Subscriptions ---
  private routerSub!: Subscription;

  // --- Reactive State (Signals) ---
  rentals = signal<RentalItem[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal<number | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // 1. Initial Data Loads
    this.fetchCategories();
    this.fetchData();

    // 2. Navigation Watcher to clear loaders on route change
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loader.stopAll();
      }
    });
  }

  /**
   * Loads all categories for the filter bar
   */
  fetchCategories(): void {
    this.cameraService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data);
        }
      },
      error: (err) => console.error('Category load failed:', err)
    });
  }

  /**
   * Fetches gear based on category and limits display to last 8 items
   * @param categoryId - Optional ID to filter by category
   */
  fetchData(categoryId: number | null = null): void {
    this.isLoading.set(true);
    this.selectedCategory.set(categoryId); // Update active chip in UI

    const filters = categoryId ? { categoryId } : {};

    this.cameraService.getAllCameras(filters).subscribe({
      next: (response: any) => {
        if (response.success) {
          // KEY: Take only the first 8 items (Latest 8 because of backend DESC order)
          const latestGear = response.data.slice(0, 10);
          this.rentals.set(latestGear);
          this.error.set(null);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load gear.');
        this.isLoading.set(false);
        this.toastr.error('Could not fetch rental items', 'Network Error');
      }
    });
  }

  /**
   * Handle Add to Cart with Event Bubbling Prevention
   */
  onAddToCart(event: Event, item: RentalItem): void {
    event.stopPropagation(); // Prevents navigating to details page
    this.loader.start();

    this.cartService.addToCart(item.id, 1).subscribe({
      next: () => {
        this.loader.stop();
        this.toastr.success(`${item.name} added to cart!`, 'Success');
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to add item to cart', 'Error');
      }
    });
  }

  /**
   * Handle Wishlist logic
   */
  onWishlist(event: Event, item: RentalItem): void {
    event.stopPropagation();
    this.toastr.info('Saved to your wishlist!', item.name);
  }
}