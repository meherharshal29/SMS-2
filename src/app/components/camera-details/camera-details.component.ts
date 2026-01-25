import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser'; // Import for SEO
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';

import { CameraService, Camera } from '../../services/camera/camera.service';
import { CartService } from '../../services/cart/cart.service';
import { ReviewService, Review } from '../../services/review/review.service';
import { RentalComponent } from "../rental/rental.component";
import { FooterComponent } from "../../common/footer/footer.component";

@Component({
  selector: 'app-camera-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, DecimalPipe, NgxUiLoaderModule, RentalComponent, FooterComponent],
  templateUrl: './camera-details.component.html',
  styleUrl: './camera-details.component.scss'
})
export class CameraDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cameraService = inject(CameraService);
  private cartService = inject(CartService);
  private reviewService = inject(ReviewService);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private titleService = inject(Title); // SEO
  private metaService = inject(Meta);   // SEO

  private routeSub!: Subscription;

  camera = signal<Camera | null>(null);
  selectedImage = signal<string>('');
  isLoading = signal<boolean>(true);
  showAllReviews = signal<boolean>(false);
  reviews = signal<Review[]>([]);
  isSubmittingReview = signal<boolean>(false);
  editingReviewId = signal<number | null>(null);

  currentUserId = computed(() => this.reviewService.getUserIdFromToken());

  averageRating = computed(() => {
    const data = this.reviews();
    if (data.length === 0) return this.camera()?.avgRating || 0;
    return data.reduce((acc, r) => acc + (r.rating || 0), 0) / data.length;
  });

  newReview = { cameraId: 0, rating: 5, comment: '' };

  parsedSpecs = signal<Record<string, any>>({});
  readonly displaySpecKeys = [
    { key: 'resolution', label: 'Resolution' },
    { key: 'sensorType', label: 'Sensor Type' },
    { key: 'isoRange', label: 'ISO Range' },
    { key: 'videoResolution', label: 'Video Specs' },
    { key: 'lensMount', label: 'Lens Mount' },
    { key: 'weight', label: 'Weight' }
  ];

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.newReview.cameraId = +id;
        this.loadInitialData(id);
      }
    });
  }

  private loadInitialData(id: string): void {
    this.isLoading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.cameraService.getCameraById(id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const cam = res.data;
          this.camera.set(cam);
          this.selectedImage.set(cam.displayImage || '');

          // --- SEO Optimization ---
          this.titleService.setTitle(`Rent ${cam.brand} ${cam.name} | SmartMedia`);
          this.metaService.updateTag({ name: 'description', content: cam.description.substring(0, 160) });

          // --- Specification Handling ---
          // Ensure we handle both object and stringified JSON from DB
          let specs = cam.specifications;
          if (typeof specs === 'string') {
            try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
          }
          this.parsedSpecs.set(specs || {});

          this.loadReviews(id);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Equipment not found');
        this.router.navigate(['/rental-all-item']);
        this.isLoading.set(false);
      }
    });
  }

  loadReviews(cameraId: string): void {
    this.reviewService.getCameraReviews(+cameraId).subscribe({
      next: (res) => this.reviews.set(res.data || []),
      error: () => this.reviews.set([])
    });
  }

  onAddToCart(event: Event, item: Camera): void {
    event.stopPropagation();
    this.loader.start();
    this.cartService.addToCart(item.id, 1, 1).subscribe({
      next: () => {
        this.loader.stop();
        this.toastr.success(`${item.name} added to cart!`);
      },
      error: (err) => {
        this.loader.stop();
        this.toastr.error(err.error?.message || 'Error adding to cart');
      }
    });
  }

  submitReview(): void {
    if (!this.newReview.comment.trim()) return;
    this.isSubmittingReview.set(true);

    const request = this.editingReviewId()
      ? this.reviewService.updateReview(this.editingReviewId()!, this.newReview as Review)
      : this.reviewService.addReview(this.newReview as Review);

    request.subscribe({
      next: () => {
        this.toastr.success('Success!');
        this.resetReviewForm();
        this.loadReviews(this.newReview.cameraId.toString());
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Error');
        this.isSubmittingReview.set(false);
      }
    });
  }

  changeImage(url: string): void { this.selectedImage.set(url); }
  resetReviewForm(): void { this.newReview.comment = ''; this.newReview.rating = 5; this.editingReviewId.set(null); this.isSubmittingReview.set(false); }
  onWishlist(event: Event, item: Camera): void { event.stopPropagation(); this.toastr.info('Saved!', item.name); }
  ngOnDestroy(): void { this.routeSub?.unsubscribe(); this.loader.stopAll(); }
}