import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

// Feature Components
import { HeroComponent } from "../hero/hero.component";
import { ProductComponent } from "../product/product.component";
import { PromoComponent } from "../promo/promo.component";
import { RentalComponent } from "../rental/rental.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { ReviewsComponent } from "../reviews/reviews.component";
import { CourseGridComponent } from "../course-grid/course-grid.component";
import { Component, OnInit, inject, PLATFORM_ID, signal, computed, HostListener } from '@angular/core';

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
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroComponent,
    ProductComponent,
    PromoComponent,
    RentalComponent,
    CourseGridComponent,
    ReviewsComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  showScroll = signal(false);
  selectedItem = signal<GalleryItem | null>(null);

  allItems = signal<GalleryItem[]>([
    { id: 1, type: 'photo', size: 'big', url: 'https://picsum.photos/seed/1/800', title: 'Studio Fashion', category: 'Photography' },
    { id: 2, type: 'video', size: 'normal', url: 'https://picsum.photos/seed/2/800', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Brand Story', category: 'Cinematography' },
    { id: 3, type: 'photo', size: 'wide', url: 'https://picsum.photos/seed/3/1200/600', title: 'Urban Mood', category: 'Portrait' },
    { id: 4, type: 'album', size: 'tall', url: 'https://picsum.photos/seed/4/600/1200', title: 'Wedding Day', category: 'Albums' },
    { id: 5, type: 'photo', size: 'normal', url: 'https://picsum.photos/seed/5/800', title: 'Visual Art', category: 'Production' },
    { id: 6, type: 'video', size: 'wide', url: 'https://picsum.photos/seed/6/1200/600', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Motion Clips', category: 'Cinematography' },
    { id: 7, type: 'photo', size: 'tall', url: 'https://picsum.photos/seed/7/600/1200', title: 'Vogue Style', category: 'Fashion' },
    { id: 8, type: 'photo', size: 'normal', url: 'https://picsum.photos/seed/8/800', title: 'Nature Bloom', category: 'Production' },
    { id: 9, type: 'album', size: 'big', url: 'https://picsum.photos/seed/9/1200/1200', title: 'Heritage', category: 'Albums' },
    { id: 10, type: 'photo', size: 'normal', url: 'https://picsum.photos/seed/10/800', title: 'Street Echo', category: 'Portrait' },
  ]);

  previewItems = computed(() => this.allItems().slice(0, 10));

  ngOnInit(): void {
    this.setSEO();
  }

  setSEO(): void {
    // 1. Browser Tab Title
    this.titleService.setTitle('Smart Media Studio | Professional Photography & Courses');

    // 2. Meta Description for Google
    this.metaService.updateTag({
      name: 'description',
      content: 'Experience high-end photography, cinematic video production, and professional editing courses at Smart Media Studio. View our portfolio today.'
    });

    // 3. Keywords
    this.metaService.updateTag({
      name: 'keywords',
      content: 'Photography studio, cinematography, video editing course India, wedding album design, professional portraits'
    });

    // 4. Social Media Sharing (Open Graph)
    this.metaService.updateTag({ property: 'og:title', content: 'Smart Media Studio - Capture Your Story' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:description', content: 'Explore our studio gallery and join our expert-led photography courses.' });

    // IMPORTANT: Replace with a real URL to a high-res image of your studio
    this.metaService.updateTag({ property: 'og:image', content: 'https://picsum.photos/seed/studio/1200/630' });

    // 5. Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.showScroll.set(window.scrollY > 500);
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openLightbox(item: GalleryItem) {
    this.selectedItem.set(item);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox() {
    this.selectedItem.set(null);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  viewAll() {
    this.router.navigate(['/gallary']);
  }
}