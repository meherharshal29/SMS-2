import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, signal, computed, Inject, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FooterComponent } from "../../common/footer/footer.component";
import { GalleryService, GalleryItem } from '../../services/gallery/gallery.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-studio-gallery',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './studio-gallery.component.html',
  styleUrl: './studio-gallery.component.scss'
})
export class StudioGalleryComponent implements OnInit, AfterViewInit {
  @ViewChildren('itemRef') itemRefs!: QueryList<ElementRef>;

  private galleryService = inject(GalleryService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  // --- Signals ---
  allItems = signal<GalleryItem[]>([]);
  activeFilter = signal<string>('all');
  displayLimit = signal<number>(10);
  selectedItem = signal<GalleryItem | null>(null);

  ngOnInit() {
    this.loadGallery();
  }

  /**
   * Loads real data from the Backend
   */
  loadGallery() {
    this.galleryService.getGalleryItems().subscribe({
      next: (data) => {
        // We set the data array directly from the mapped service response
        this.allItems.set(data);

        // Ensure GSAP runs after the DOM has been updated by Angular's @for loop
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initAnimations(), 200);
        }
      },
      error: (err) => console.error('Error fetching studio gallery:', err)
    });
  }

  /**
   * Computed logic for Filtering and Pagination
   * Now uses 'mediaType' to match your backend model
   */
  filteredItems = computed(() => {
    const data = this.allItems();
    if (!Array.isArray(data)) return [];

    const filter = this.activeFilter();
    const limit = this.displayLimit();

    // Filter by 'mediaType' (photo, video, reel)
    const filtered = filter === 'all'
      ? data
      : data.filter(i => i.mediaType === filter);

    return filtered.slice(0, limit);
  });

  /**
   * Determines visibility of the "EXTEND GALLERY" button
   */
  hasMore = computed(() => {
    const filter = this.activeFilter();
    const data = this.allItems();

    const filteredCount = filter === 'all'
      ? data.length
      : data.filter(i => i.mediaType === filter).length;

    return this.displayLimit() < filteredCount;
  });

  ngAfterViewInit() {
    // Initial animation for any data already present
    if (isPlatformBrowser(this.platformId) && this.allItems().length > 0) {
      this.initAnimations();
    }
  }

  /**
   * GSAP Animation - Staggered Fade-in
   */
  initAnimations() {
    if (this.itemRefs && this.itemRefs.length > 0) {
      const elements = this.itemRefs.map(i => i.nativeElement);

      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    }
  }

  loadMore() {
    // Reveal all available items in the current filter
    this.displayLimit.set(this.allItems().length);
    setTimeout(() => this.initAnimations(), 100);
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
    this.displayLimit.set(10); // Reset limit when switching categories
    setTimeout(() => this.initAnimations(), 100);
  }

  /**
   * Lightbox Control
   */
  openLightbox(item: GalleryItem) {
    this.selectedItem.set(item);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden'; // Stop background scrolling
    }
  }

  closeLightbox() {
    this.selectedItem.set(null);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = ''; // Restore background scrolling
    }
  }

  viewAll() {
    this.router.navigate(['/gallary']);
  }
}