import {
  Component,
  signal,
  inject,
  PLATFORM_ID,
  HostListener,
  OnInit,
  OnDestroy,
  effect,
  computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterModule } from "@angular/router";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services
import { CartService } from '../../services/cart/cart.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AuthPromptModalComponent } from '../../components/auth-prompt-modal/auth-prompt-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    NgOptimizedImage,
    MatDialogModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  // --- Services ---
  public cartService = inject(CartService);
  public auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  private dialog = inject(MatDialog);

  // --- UI State Signals ---
  isMobileOpen = signal(false);
  isScrolled = signal(false);

  // --- Auth State ---
  isLoggedIn = this.auth.isLoggedIn;
  userName = computed(() => this.auth.currentUser()?.name || 'Guest');

  // Timer reference for cleanup
  private promoTimer: any;
  private readonly MODAL_SHOWN_KEY = 'auth_prompt_shown';

  constructor() {
    // Lock Body Scroll on Mobile
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = this.isMobileOpen() ? 'hidden' : 'auto';
      }
    });

    // Load Cart on Login
    effect(() => {
      if (this.isLoggedIn() && isPlatformBrowser(this.platformId)) {
        this.cartService.getUserCart().subscribe();
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Load cart if already logged in
      if (this.isLoggedIn()) {
        this.cartService.getUserCart().subscribe();
      }

      // --- Smart Suggestive Modal Logic ---
      const hasSeenModal = localStorage.getItem(this.MODAL_SHOWN_KEY);

      // Only start the 10s timer if they haven't seen it and aren't logged in
      if (!this.isLoggedIn() && !hasSeenModal) {
        this.promoTimer = setTimeout(() => {
          this.showAuthPromptIfNotLoggedIn();
        }, 10000);
      }
    }
  }

  private showAuthPromptIfNotLoggedIn(): void {
    const isAuthPage = this.router.url.includes('/auth');

    // Double-check conditions before opening
    if (!this.isLoggedIn() && !isAuthPage) {
      this.dialog.open(AuthPromptModalComponent, {
        width: '450px',
        maxWidth: '95vw',
        panelClass: 'auth-modal-overlay'
      });

      // Mark as shown so it doesn't appear again this session/refresh
      localStorage.setItem(this.MODAL_SHOWN_KEY, 'true');
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 20);
    }
  }

  toggleMobile(): void {
    this.isMobileOpen.update(state => !state);
  }

  logout(): void {
    this.auth.logout();
    this.cartService.clearCartSignal();
    // Clear the modal flag on logout so if they return as guest, 
    // they might see the prompt again later (optional)
    localStorage.removeItem(this.MODAL_SHOWN_KEY);

    this.isMobileOpen.set(false);
    this.toast.success('Logged out successfully', 'Auth');
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
      if (this.promoTimer) {
        clearTimeout(this.promoTimer);
      }
    }
  }

  // --- Navigation Data ---
  navData = [
    {
      label: 'Rentals',
      link: '/rental-all-item',
      isMega: true,
      columns: [
        {
          title: 'Cameras',
          items: [
            { name: 'Sony Alpha Series', link: '/rentals/sony' },
            { name: 'Canon R Series', link: '/rentals/canon' },
            { name: 'Cinema Line', link: '/rentals/cinema' },
          ]
        },
        {
          title: 'Gear & Audio',
          items: [
            { name: 'Pro Lenses', link: '/rentals/lenses' },
            { name: 'Stabilizers', link: '/rentals/gimbals' },
            { name: 'Wireless Audio', link: '/rentals/audio' }
          ]
        }
      ],
      featured: {
        title: 'New Arrivals',
        link: '/rentals/new',
        img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=500&q=80'
      }
    },
    {
      label: 'Packages',
      link: '/packages',
      isMega: true,
      columns: [
        {
          title: 'Wedding & Events',
          items: [
            { name: 'Pre-Wedding Shoots', link: '/packages/pre-wedding' },
            { name: 'Full Wedding Coverage', link: '/packages/wedding' },
            { name: 'Event Videography', link: '/packages/events' },
          ]
        },
        {
          title: 'Commercial',
          items: [
            { name: 'Product Photography', link: '/packages/product' },
            { name: 'Corporate Headshots', link: '/packages/corporate' },
            { name: 'Brand Films', link: '/packages/brand' }
          ]
        }
      ],
      featured: {
        title: 'Wedding Special',
        link: '/packages/wedding',
        img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80'
      }
    },
    {
      label: 'Courses',
      link: '/courses',
      isMega: true,
      columns: [
        {
          title: 'Photography',
          items: [
            { name: 'Beginner Basics', link: '/courses/basics' },
            { name: 'Mastering Lighting', link: '/courses/lighting' },
            { name: 'Portrait Masterclass', link: '/courses/portrait' },
          ]
        },
        {
          title: 'Post-Production',
          items: [
            { name: 'Adobe Lightroom', link: '/courses/lightroom' },
            { name: 'DaVinci Resolve', link: '/courses/davinci' },
            { name: 'Premiere Pro', link: '/courses/premiere' }
          ]
        }
      ],
      featured: {
        title: 'Start Learning',
        link: '/courses',
        img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80'
      }
    },
    {
      label: 'Studio',
      link: '/gallery',
      isMega: false
    }
  ];
}