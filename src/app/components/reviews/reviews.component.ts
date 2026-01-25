import { Component, OnInit, inject, signal, computed, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; //
import { FormsModule } from '@angular/forms';
import { UserReviewService, UserReview } from '../../services/review/user-review.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent implements OnInit {
  private reviewService = inject(UserReviewService);
  private platformId = inject(PLATFORM_ID); //

  reviews = signal<any[]>([]);
  currentIndex = signal(0);
  isMobile = signal(false);

  newReview: UserReview = { rating: 5, comment: '', referenceId: 0, type: 'general' };
  isSubmitting = signal(false);

  ngOnInit() {
    this.loadPublicTestimonials();
    // Safety check: Only access 'window' if we are in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  getAvatarColor(name: string): string {
    const colors = ['#E0E7FF', '#FCE7F3', '#DCFCE7', '#FEF3C7', '#F3E8FF', '#FFEDD5'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  loadPublicTestimonials() {
    this.reviewService.getReviewsByItem(0, 'general').subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.reviews.set(res.data.map((r: any) => ({
            id: r.id,
            text: r.comment,
            author: r.author?.name || 'Valued Client',
            role: r.author?.role || 'Verified Customer',
            initial: (r.author?.name || 'V').charAt(0).toUpperCase(),
            color: this.getAvatarColor(r.author?.name || 'Valued Client'),
            rating: r.rating
          })));
        }
      }
    });
  }

  submitReview() {
    if (!this.newReview.comment.trim()) return;
    this.isSubmitting.set(true);
    this.reviewService.addReview(this.newReview).subscribe({
      next: () => {
        this.newReview.comment = '';
        this.loadPublicTestimonials();
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  setRating(s: number) { this.newReview.rating = s; }

  // Use HostListener with a platform check for stability
  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth < 992);
    }
  }

  visibleReviews = computed(() => {
    const all = this.reviews();
    if (all.length === 0) return [];
    const i = this.currentIndex();
    // Default to desktop view during SSR to avoid layout shifts
    const mobile = this.isMobile();
    return mobile ? [all[i % all.length]] : [all[i % all.length], all[(i + 1) % all.length]];
  });

  next() { if (this.reviews().length) this.currentIndex.update(v => (v + 1) % this.reviews().length); }
  prev() { if (this.reviews().length) this.currentIndex.update(v => (v - 1 + this.reviews().length) % this.reviews().length); }
  setSlide(i: number) { this.currentIndex.set(i); }
}