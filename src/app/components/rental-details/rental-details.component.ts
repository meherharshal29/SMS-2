import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CameraService } from '../../services/camera/camera.service';
import { CartService } from '../../services/cart/cart.service';
import { FooterComponent } from "../../common/footer/footer.component";

@Component({
  selector: 'app-rental-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, FooterComponent],
  templateUrl: './rental-details.component.html',
  styleUrl: './rental-details.component.scss'
})
export class RentalDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cameraService = inject(CameraService);
  private cartService = inject(CartService);

  camera = signal<any>(null);
  rentals = signal<any[]>([]);
  selectedImage = signal<string>('');
  isLoading = signal<boolean>(true);
  quantity = signal<number>(1);
  isScrolled = signal<boolean>(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        window.scrollTo(0, 0);
        this.loadData(id);
      }
    });
  }

  loadData(id: string) {
    this.isLoading.set(true);
    this.cameraService.getCameraById(id).subscribe({
      next: (data) => {
        const images = data.all_images ? data.all_images.split(',') : (data.images || []);
        this.camera.set({ ...data, images });
        if (images.length > 0) this.selectedImage.set(images[0]);
        this.isLoading.set(false);
        this.fetchRelated();
      },
      error: () => this.isLoading.set(false)
    });
  }

  fetchRelated() {
    this.cameraService.getAllCameras().subscribe(data => {
      const currentId = this.camera()?.id;

      const serialized = data
        .filter((c: any) => c.id !== currentId)
        .map((item: any) => ({
          ...item,
          // Create a direct displayImage property for the grid template
          displayImage: item.images?.[0]?.image_url || 'assets/placeholder.jpg'
        }))
        .slice(0, 4);

      this.rentals.set(serialized);
    });
  }

  updatePreview(url: string) { this.selectedImage.set(url); }
  incrementQuantity() { this.quantity.update(v => v + 1); }
  decrementQuantity() { this.quantity.update(v => Math.max(1, v - 1)); }
  getTotalPrice(): number { return (this.camera()?.price_per_day || 0) * this.quantity(); }

  // FIXED: Accepts optional camera for Quick Add
  addToCart(selectedItem?: any) {
    const target = selectedItem || this.camera();
    const qty = selectedItem ? 1 : this.quantity();

    this.cartService.addToCart(target.id, qty).subscribe({
      next: () => alert(`${target.model_name} added to cart!`),
      error: (err) => console.error(err)
    });
  }
}