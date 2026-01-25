import { Component, OnInit, inject, PLATFORM_ID, computed, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, TitleCasePipe, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { OrderService, Order } from '../../services/order/order.service';
import { BookingService, Booking } from '../../services/booking/booking.service';
import { ToastrService } from 'ngx-toastr';
import { FooterComponent } from "../../common/footer/footer.component";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  accountStatus?: string;
  createdAt?: string;
  role?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, DatePipe, DecimalPipe, RouterModule, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private bookingService = inject(BookingService);
  private toast = inject(ToastrService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // --- Reactive State ---
  user = computed(() => this.authService.currentUser() as User | null);
  orders = signal<Order[]>([]);
  bookings = signal<Booking[]>([]);
  isLoading = signal<boolean>(true);

  // --- Derived Stats ---
  confirmedRentalsCount = computed(() =>
    this.orders().filter(o => o.status.toLowerCase() === 'confirmed' || o.status.toLowerCase() === 'shipped').length
  );

  confirmedShootsCount = computed(() =>
    this.bookings().filter(b => b.status.toLowerCase() === 'confirmed' || b.status.toLowerCase() === 'completed').length
  );

  totalExpenditure = computed(() => {
    const gearTotal = this.orders().filter(o => o.status.toLowerCase() !== 'cancelled')
      .reduce((acc, o) => acc + Number(o.totalPrice || 0), 0);
    const shootTotal = this.bookings().filter(b => b.status.toLowerCase() !== 'cancelled')
      .reduce((acc, b) => acc + Number(b.package?.price || 0), 0);
    return gearTotal + shootTotal;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.authService.syncProfile().subscribe({
      next: (res) => {
        if (res && res.success) {
          this.fetchUserOrders();
          this.fetchUserBookings();
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) this.toast.error('Session expired.');
      }
    });
  }

  fetchUserOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data) => this.orders.set(data),
      error: () => this.toast.error('Could not load gear rentals')
    });
  }

  fetchUserBookings(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getInitials(): string {
    const name = this.user()?.name;
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    const map: Record<string, string> = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'completed': 'status-confirmed',
      'shipped': 'status-shipped',
      'cancelled': 'status-cancelled'
    };
    return map[s] || 'status-default';
  }

  logout(): void {
    this.authService.logout();
    this.toast.success('Logged out successfully');
    this.router.navigate(['/auth/login']);
  }
}