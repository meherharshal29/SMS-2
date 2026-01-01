import {
  Component,
  signal,
  inject,
  Inject,
  PLATFORM_ID,
  HostListener,
  OnInit,
  OnDestroy,
  effect,
  computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterModule } from "@angular/router";
import { CartService } from '../../services/cart/cart.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, NgOptimizedImage],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  // --- Services ---
  public cartService = inject(CartService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastrService);

  // --- UI State Signals ---
  isMobileOpen = signal(false);
  activeHover = signal<string | null>(null);
  isScrolled = signal(false);

  // --- Auth State Signals ---
  isLoggedIn = signal(false);
  userName = signal<string | null>('Guest');

  // --- Subscriptions Trackers ---
  private authSub?: Subscription;
  private userSub?: Subscription;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    /**
     * EFFECT: Background Scroll Lock
     * Automatically monitors the 'isMobileOpen' signal.
     */
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = this.isMobileOpen() ? 'hidden' : 'auto';
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Initial load of the cart
      this.cartService.loadCart();
      this.initAuthSubscriptions();
    }
  }

  /**
   * Syncs Auth state from the AuthService observables into our Signals
   */
  private initAuthSubscriptions(): void {
    this.authSub = this.auth.isLoggedIn$.subscribe({
      next: (status) => {
        this.isLoggedIn.set(status);
        // Refresh cart when login status changes to fetch user-specific items
        if (status) {
          this.cartService.loadCart();
        }
      },
      error: (err) => console.error('Auth Status Error:', err)
    });

    this.userSub = this.auth.currentUser$.subscribe({
      next: (user) => this.userName.set(user?.name || 'Guest'),
      error: (err) => console.error('User Profile Error:', err)
    });
  }

  /**
   * HostListener to detect window scroll for styling changes
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 20);
    }
  }

  /**
   * Toggles the Mobile Drawer state
   */
  toggleMobile(): void {
    this.isMobileOpen.update(state => !state);
  }

  /**
   * Handles User Logout with Premium Toast Notification
   */
  logout(): void {
    this.auth.logout();
    this.isMobileOpen.set(false);

    this.toast.success('Logged out successfully', 'Auth', {
      toastClass: 'ngx-toastr custom-toast'
    });

    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.authSub?.unsubscribe();
    this.userSub?.unsubscribe();

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  // --- Navigation Structure ---
  navData = [
    {
      label: 'Rentals',
      allLink: '/rental-all-item',
      columns: [
        {
          title: 'Cameras',
          items: [
            { name: 'Sony A7IV', link: '/rental/sony-a7iv' },
            { name: 'Canon R6', link: '/rental/canon-r6' },
            { name: 'Red Komodo', link: '/rental/red-komodo' },
          ]
        },
        {
          title: 'Accessories',
          items: [
            { name: 'Lenses', link: '/rentals/lenses' },
            { name: 'Gimbals', link: '/rentals/gimbals' },
            { name: 'Audio Kit', link: '/rentals/audio' }
          ]
        }
      ],
      featured: {
        title: 'New Arrivals',
        link: '/rentals/new',
        img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400'
      }
    }
  ];
}