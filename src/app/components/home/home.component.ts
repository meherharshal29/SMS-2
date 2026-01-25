import {
  Component,
  OnInit,
  OnDestroy, // Added for cleanup
  inject,
  PLATFORM_ID,
  signal,
  computed,
  HostListener,
  afterNextRender
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Added Router
import { Meta, Title } from '@angular/platform-browser';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Added

// Services
import { Package, PackageService } from '../../services/package/package.service';
import { AuthService } from '../../auth/services/auth.service'; // Added

// Feature Components
import { HeroComponent } from "../hero/hero.component";
import { ProductComponent } from "../product/product.component";
import { PromoComponent } from "../promo/promo.component";
import { RentalComponent } from "../rental/rental.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { ReviewsComponent } from "../reviews/reviews.component";
import { RequestCallModalComponent } from '../request-call-modal/request-call-modal.component'; // Adjust path

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule, // Added
    HeroComponent,
    ProductComponent,
    PromoComponent,
    ReviewsComponent,
    FooterComponent,
    RentalComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private packageService = inject(PackageService);
  private auth = inject(AuthService);
  private meta = inject(Meta);
  private title = inject(Title);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // --- UI States ---
  showScroll = signal(false);
  isBrowser = signal(false);

  // --- Data Signals ---
  allPackages = signal<Package[]>([]);
  visiblePackageCount = signal(4);

  // --- Suggestion Timer ---
  private callRequestTimer: any;
  private readonly CALL_PROMPT_KEY = 'call_request_suggested';

  // --- Computed States ---
  displayPackages = computed(() => this.allPackages().slice(0, this.visiblePackageCount()));

  constructor() {
    this.isBrowser.set(isPlatformBrowser(this.platformId));

    afterNextRender(() => {
      this.onWindowScroll();
    });
  }

  ngOnInit(): void {
    this.setSEO();
    this.loadPackages();

    // Trigger the Call Request suggestion after 20 seconds
    if (this.isBrowser()) {
      this.initCallRequestSuggestion();
    }
  }

  private initCallRequestSuggestion(): void {
    const hasBeenSuggested = localStorage.getItem(this.CALL_PROMPT_KEY);

    // Only set timer if user is logged in (as backend needs user info) 
    // and hasn't seen this suggestion yet
    if (this.auth.isLoggedIn() && !hasBeenSuggested) {
      this.callRequestTimer = setTimeout(() => {
        this.openCallRequestModal();
      }, 20000); // 20 Seconds
    }
  }

  private openCallRequestModal(): void {
    // Check if user is still on the home page and not in auth flow
    if (!this.router.url.includes('/auth')) {
      this.dialog.open(RequestCallModalComponent, {
        width: '450px',
        maxWidth: '95vw',
        panelClass: 'call-request-popup'
      });

      // Mark as suggested so it doesn't show again and again
      localStorage.setItem(this.CALL_PROMPT_KEY, 'true');
    }
  }

  // --- Existing Methods ---
  private setSEO(): void {
    this.title.setTitle('Premium Photography Packages & Camera Rentals | YourBrandName');
    this.meta.updateTag({ name: 'description', content: 'Professional wedding photography collections and premium camera rentals.' });

    if (this.isBrowser()) {
      this.addStructuredData();
    }
  }

  private addStructuredData(): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Your Brand Name",
      "url": window.location.origin,
      "telephone": "+919834996139",
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  loadPackages(): void {
    this.packageService.getActivePackages('All').subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.allPackages.set(data);
      },
      error: (err) => console.error('Package Load Error:', err)
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isBrowser()) {
      const shouldShow = window.scrollY > 600;
      if (this.showScroll() !== shouldShow) {
        this.showScroll.set(shouldShow);
      }
    }
  }

  scrollToTop(): void {
    if (this.isBrowser()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    // Crucial: Clear timer if user leaves the home page before 20s
    if (this.callRequestTimer) {
      clearTimeout(this.callRequestTimer);
    }
  }
}