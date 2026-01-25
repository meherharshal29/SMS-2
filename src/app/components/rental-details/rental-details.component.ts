import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Camera, CameraService } from '../../services/camera/camera.service';
import { CartService } from '../../services/cart/cart.service';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { FooterComponent } from "../../common/footer/footer.component";
import { RentalComponent } from "../rental/rental.component";
import { finalize } from 'rxjs';

@Component({
  selector: 'app-rental-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxUiLoaderModule, FooterComponent, RentalComponent],
  templateUrl: './rental-details.component.html',
  styleUrls: ['./rental-details.component.scss']
})
export class RentalDetailsComponent implements OnInit {
  // Services
  private route = inject(ActivatedRoute);
  private cameraService = inject(CameraService);
  private cartService = inject(CartService);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);

  // State Management
  camera = signal<Camera | null>(null);
  relatedCameras = signal<Camera[]>([]);
  activeImage = signal<string>('');
  loading = signal<boolean>(true);

  ngOnInit(): void {
    // Listen for route changes (e.g., clicking a "Related" camera)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.prepareNavigation();
        this.loadData(id);
      }
    });
  }

  private prepareNavigation(): void {
    // 1. Reset scroll for UX
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 2. Clear current view so user doesn't see old data while loading new data
    this.camera.set(null);
  }

  loadData(id: string): void {
    this.loading.set(true);
    this.loader.start(); // Start NgxUiLoader

    this.cameraService.getCameraById(id).pipe(
      finalize(() => {
        this.loading.set(false);
        this.loader.stop(); // Ensures loader stops even if request fails
      })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.camera.set(res.data);
          this.activeImage.set(res.data.displayImage || '');
          this.loadRelated(res.data.categoryId);
        }
      },
      error: () => {
        this.toastr.error('Failed to load camera details');
      }
    });
  }

  loadRelated(categoryId: number): void {
    this.cameraService.getAllCameras({ categoryId }).subscribe({
      next: (res) => {
        if (res.success) {
          // Exclude current camera and limit to 8 results
          const suggestions = res.data
            .filter((c: Camera) => c.id !== this.camera()?.id)
            .slice(0, 8);
          this.relatedCameras.set(suggestions);
        }
      }
    });
  }

  /**
   * Computed property logic to transform specs for the template
   */
  get specEntries() {
    const specs = this.camera()?.specifications;
    if (!specs) return [];
    return Object.entries(specs).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').trim().toUpperCase(),
      value: value || 'N/A'
    }));
  }

  onAddToCart(): void {
    const item = this.camera();
    if (!item) return;

    this.loader.start();
    this.cartService.addToCart(item.id, 1).pipe(
      finalize(() => this.loader.stop())
    ).subscribe({
      next: () => {
        this.toastr.success(`${item.name} added to cart!`);
      },
      error: () => {
        this.toastr.error('Could not add to cart');
      }
    });
  }

  onAddToCartSuggested(event: Event, item: Camera): void {
    event.stopPropagation();
    this.loader.start();
    this.cartService.addToCart(item.id, 1).pipe(
      finalize(() => this.loader.stop())
    ).subscribe({
      next: () => {
        this.toastr.success(`${item.name} added to cart!`);
      },
      error: () => this.toastr.error('Cart update failed')
    });
  }

  changeImage(url: string): void {
    this.activeImage.set(url);
  }
}