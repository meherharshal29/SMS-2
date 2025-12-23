import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FooterComponent } from "../../common/footer/footer.component";

gsap.registerPlugin(ScrollTrigger);

interface GalleryItem {
  id: number;
  type: 'photo' | 'video' | 'album';
  size: 'normal' | 'wide' | 'tall' | 'big';
  url: string;
  videoUrl?: string;
  title: string;
  category: string;
}

@Component({
  selector: 'app-studio-gallery',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './studio-gallery.component.html',
  styleUrl: './studio-gallery.component.scss'
})
export class StudioGalleryComponent implements AfterViewInit {
  @ViewChildren('itemRef') itemRefs!: QueryList<ElementRef>;

  activeFilter = signal<string>('all');
  displayLimit = signal<number>(10); // Initial display count

  // Full array of 20 images
  allItems = signal<GalleryItem[]>([
    { id: 1, type: 'photo', size: 'big', url: 'https://picsum.photos/seed/1/1200/1200', title: 'Editorial Shoot', category: 'Fashion' },
    { id: 2, type: 'video', size: 'normal', url: 'https://picsum.photos/seed/2/800/800', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Brand Story', category: 'Cinematography' },
    { id: 3, type: 'photo', size: 'wide', url: 'https://picsum.photos/seed/3/1200/600', title: 'Urban Light', category: 'Portrait' },
    { id: 4, type: 'album', size: 'tall', url: 'https://picsum.photos/seed/4/600/1200', title: 'Wedding Day', category: 'Albums' },
    { id: 5, type: 'photo', size: 'normal', url: 'https://picsum.photos/seed/5/800/800', title: 'Visual Art', category: 'Production' },
    { id: 6, type: 'video', size: 'wide', url: 'https://picsum.photos/seed/6/1200/600', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Cinematic Motion', category: 'Cinematography' },
    { id: 7, type: 'photo', size: 'tall', url: 'https://picsum.photos/seed/7/600/1200', title: 'Vogue Portrait', category: 'Fashion' },
    { id: 8, type: 'photo', size: 'normal', url: 'https://picsum.photos/seed/8/800/800', title: 'Nature Bloom', category: 'Production' },
    { id: 9, type: 'album', size: 'big', url: 'https://picsum.photos/seed/9/1200/1200', title: 'Heritage Collection', category: 'Albums' },
    { id: 10, type: 'photo', size: 'normal', url: 'https://picsum.photos/seed/10/800/800', title: 'Street Echo', category: 'Portrait' },
    { id: 11, type: 'video', size: 'tall', url: 'https://picsum.photos/seed/11/600/1200', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Urban Flow', category: 'Cinematography' },
    { id: 12, type: 'photo', size: 'wide', url: 'https://picsum.photos/seed/12/1200/600', title: 'Golden Hour', category: 'Fashion' },
    { id: 13, type: 'photo', size: 'normal', url: 'https://picsum.photos/seed/13/800/800', title: 'Minimalist', category: 'Portrait' },
    { id: 14, type: 'album', size: 'normal', url: 'https://picsum.photos/seed/14/800/800', title: 'Ethereal', category: 'Albums' },
    { id: 15, type: 'photo', size: 'big', url: 'https://picsum.photos/seed/15/1200/1200', title: 'Cyberpunk', category: 'Production' },
    { id: 16, type: 'video', size: 'normal', url: 'https://picsum.photos/seed/16/800/800', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Documentary', category: 'Cinematography' },
    { id: 17, type: 'photo', size: 'wide', url: 'https://picsum.photos/seed/17/1200/600', title: 'Avenue View', category: 'Portrait' },
    { id: 18, type: 'photo', size: 'tall', url: 'https://picsum.photos/seed/18/600/1200', title: 'Vantage', category: 'Fashion' },
    { id: 19, type: 'album', size: 'normal', url: 'https://picsum.photos/seed/19/800/800', title: 'Legacy', category: 'Albums' },
    { id: 20, type: 'photo', size: 'normal', url: 'https://picsum.photos/seed/20/800/800', title: 'Abstract', category: 'Production' }
  ]);

  // Filters first, then slices based on displayLimit
  filteredItems = computed(() => {
    const filter = this.activeFilter();
    const limit = this.displayLimit();
    const data = filter === 'all'
      ? this.allItems()
      : this.allItems().filter(i => i.type === filter);

    return data.slice(0, limit);
  });

  // Determines if the "Extend" button should be visible
  hasMore = computed(() => {
    const filter = this.activeFilter();
    const totalCount = filter === 'all'
      ? this.allItems().length
      : this.allItems().filter(i => i.type === filter).length;

    return this.displayLimit() < totalCount;
  });

  selectedItem = signal<GalleryItem | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
    }
  }

  previewItems = computed(() => this.allItems().slice(0, 10));

  loadMore() {
    this.displayLimit.set(this.allItems().length);
    setTimeout(() => this.initAnimations(), 100);
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
    this.displayLimit.set(10); // Reset limit when filter changes
    setTimeout(() => this.initAnimations(), 100);
  }

  initAnimations() {
    gsap.fromTo(this.itemRefs.map(i => i.nativeElement),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: 'power2.out' }
    );
  }

  openLightbox(item: GalleryItem) {
    this.selectedItem.set(item);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.selectedItem.set(null);
    document.body.style.overflow = '';
  }

  viewAll() {
    this.router.navigate(['/gallary']);
  }
}