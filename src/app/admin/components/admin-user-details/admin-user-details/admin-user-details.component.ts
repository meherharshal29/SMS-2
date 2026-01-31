import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminUserDetailsService } from '../../../services/admin-user-details/admin-user-details.service';

/** * Interface for Gear Rental Orders
 */
export interface Order {
  id: number;
  totalPrice: number;
  status: string;
  rentalStartDate: string;
  rentalEndDate: string;
  paymentMethod: string;
  Camera?: {
    name: string;
    brand: string;
    images: Array<{ url: string }>;
  };
}

/** * Interface for Photoshoot Bookings
 */
export interface Booking {
  id: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  eventDate: string;
  eventLocation: string;
  package?: {
    title: string;
    price: number;
    coverImage: string;
  };
}

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    UpperCasePipe,
    DecimalPipe
  ],
  templateUrl: './admin-user-details.component.html',
  styleUrl: './admin-user-details.component.scss'
})
export class AdminUserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private detailsService = inject(AdminUserDetailsService);

  // --- Reactive State Management ---
  userData = signal<any>(null);
  userBookings = signal<Booking[]>([]);
  isLoading = signal<boolean>(true);

  // --- Financial Metrics (Auto-calculated via Computed Signals) ---

  /** Calculates total spent on Gear Rentals */
  totalGearSpend = computed(() => {
    const orders: Order[] = this.userData()?.orderHistory || [];
    return orders
      .filter(o => o.status.toLowerCase() !== 'cancelled')
      .reduce((acc, o) => acc + Number(o.totalPrice || 0), 0);
  });

  /** Calculates total spent on Shoot Packages */
  totalShootSpend = computed(() => {
    const bookings = this.userBookings().length > 0
      ? this.userBookings()
      : (this.userData()?.bookingHistory || []);

    return bookings.filter((b: Booking) => b.status.toLowerCase() !== 'cancelled')

      .reduce((acc: number, b: Booking) => acc + Number(b.package?.price || 0), 0);

  });


  /** Aggregated revenue from this user */
  lifetimeRevenue = computed(() => this.totalGearSpend() + this.totalShootSpend());

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadAllUserData(userId);
    }
  }

  /**
   * Loads profile, gear history, and package bookings in parallel
   */
  loadAllUserData(id: string): void {
    this.isLoading.set(true);

    // Fetch aggregated data (Profile + Gear + Bookings)
    this.detailsService.getUserFullDetails(id).subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.userData.set(res.data);
          // Sync bookings to the specific signal if returned in aggregate
          if (res.data.bookingHistory) {
            this.userBookings.set(res.data.bookingHistory);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Specialized function to fetch/refresh only the package bookings for this user
   */
  loadParticularUserPackages(userId: string): void {
    this.detailsService.getUserBookings(userId).subscribe({
      next: (res) => {
        if (res?.success) {
          this.userBookings.set(res.data);
        }
      },
      error: (err) => console.error('Error fetching specific bookings:', err)
    });
  }

  /**
   * Dynamic CSS class generator for status badges
   */
  getStatusBadgeClass(status: string): string {
    const s = status?.toLowerCase() || '';
    const map: Record<string, string> = {
      'confirmed': 'bg-success-subtle text-success border-success',
      'completed': 'bg-success-subtle text-success border-success',
      'pending': 'bg-warning-subtle text-warning border-warning',
      'cancelled': 'bg-danger-subtle text-danger border-danger'
    };
    return map[s] || 'bg-secondary-subtle text-secondary border-secondary';
  }

  /**
   * Extracts initials from user name for the UI avatar
   */
  getInitials(): string {
    const name = this.userData()?.profile?.name;
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
}