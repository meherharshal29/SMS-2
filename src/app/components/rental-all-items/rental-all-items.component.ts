import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CameraService } from '../../services/camera/camera.service';
import { CartService } from '../../services/cart/cart.service';
import { FooterComponent } from "../../common/footer/footer.component";
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
  selector: 'app-rental-all-items',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, DecimalPipe, NgxUiLoaderModule],
  templateUrl: './rental-all-items.component.html',
  styleUrl: './rental-all-items.component.scss'
})
export class RentalAllItemsComponent implements OnInit, OnDestroy {
  private cameraService = inject(CameraService);
  private cartService = inject(CartService);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);

  rentals = signal<RentalItem[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadGear();
  }

  loadGear(): void {
    this.isLoading.set(true);
    // Loader is NOT started here to allow for silent background loading
    this.cameraService.getAllCameras().subscribe({
      next: (data) => {
        const processedData = data.map(item => ({
          ...item,
          images: item.images && Array.isArray(item.images)
            ? item.images.map((img: any) => img.image_url)
            : []
        }));
        this.rentals.set(processedData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching gear:', err);
        this.isLoading.set(false);
        this.toastr.error('Failed to load gear collection.', 'Error');
      }
    });
  }

  onAddToCart(event: Event, item: RentalItem): void {
    event.stopPropagation();

    // Loader removed from here - No full screen blocking
    this.cartService.addToCart(item.id, 1).subscribe({
      next: () => {
        // Success feedback via Toast only
        this.toastr.success(`${item.model_name} added to cart!`, 'Success', {
          toastClass: 'ngx-toastr custom-toast',
          positionClass: 'toast-top-right'
        });
      },
      error: (err) => {
        console.error('Cart Error:', err);
        this.toastr.error('Failed to add item to cart.', 'Error');
      }
    });
  }

  onWishlist(event: Event, item: RentalItem): void {
    event.stopPropagation();
    this.toastr.info('Added to wishlist', item.model_name, {
      toastClass: 'ngx-toastr custom-toast'
    });
  }

  ngOnDestroy(): void {
    // Safety cleanup to stop any accidental loaders from other parts of the app
    this.loader.stopAll();
  }
}