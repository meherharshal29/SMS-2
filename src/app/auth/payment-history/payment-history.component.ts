import { CommonModule, DecimalPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, finalize, catchError, of } from 'rxjs';

// Services
import { OrderService, Order } from '../../services/order/order.service';
import { BookingService, Booking } from '../../services/booking/booking.service';
import { FooterComponent } from "../../common/footer/footer.component";

// UI
import { NgxUiLoaderService, NgxUiLoaderModule } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { MaterialModule } from '../../shared/material/material.module';
import { Component, OnInit, inject, DestroyRef, PLATFORM_ID, signal, computed } from '@angular/core';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FooterComponent, NgxUiLoaderModule],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private bookingService = inject(BookingService);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  // --- State Signals ---
  orders = signal<Order[]>([]);
  bookings = signal<Booking[]>([]);
  isLoading = signal<boolean>(false);

  // --- Computed Stats (Merged Logic) ---
  totalSpent = computed(() => {
    const gearTotal = this.orders()
      .filter(o => ['delivered', 'confirmed', 'shipped', 'completed', 'returned'].includes(o.status?.toLowerCase()))
      .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

    const shootTotal = this.bookings()
      .filter(b => ['confirmed', 'completed'].includes(b.status?.toLowerCase()))
      .reduce((sum, b) => sum + Number(b.package?.price || 0), 0);

    return gearTotal + shootTotal;
  });

  pendingPayments = computed(() => {
    const gearPending = this.orders()
      .filter(o => o.status?.toLowerCase() === 'pending')
      .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

    const shootPending = this.bookings()
      .filter(b => b.status?.toLowerCase() === 'pending')
      .reduce((sum, b) => sum + Number(b.package?.price || 0), 0);

    return gearPending + shootPending;
  });

  ngOnInit(): void {
    // Fixed: SSR Safety Check
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllFinancialData();
    }
  }

  /**
   * Fetches data from both Gear Orders and Photography Bookings
   */
  loadAllFinancialData(): void {
    this.isLoading.set(true);
    this.loader.start();

    forkJoin({
      gear: this.orderService.getMyOrders().pipe(catchError(() => of([]))),
      shoots: this.bookingService.getMyBookings().pipe(catchError(() => of({ data: [] })))
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.isLoading.set(false);
        this.loader.stop();
      })
    ).subscribe({
      next: (res) => {
        // Data Normalization
        const gearData = Array.isArray(res.gear) ? res.gear : [];
        const shootsData = res.shoots?.data || (Array.isArray(res.shoots) ? res.shoots : []);

        this.orders.set(gearData);
        this.bookings.set(shootsData);
      },
      error: (err) => {
        this.toastr.error('Failed to sync financial records.');
        console.error('Financial sync error:', err);
      }
    });
  }

  /**
   * UI HELPER: Maps status strings to CSS classes
   * Accepts undefined to prevent ngtsc(2345)
   */
  getStatusClass(status: string | undefined): string {
    if (!status) return 'badge bg-secondary-soft text-secondary';

    const s = status.toLowerCase();
    const successList = ['confirmed', 'shipped', 'delivered', 'completed', 'returned'];

    if (successList.includes(s)) return 'badge bg-success-soft text-success';
    if (s === 'pending') return 'badge bg-warning-soft text-warning';
    if (s === 'cancelled' || s === 'cancel') return 'badge bg-danger-soft text-danger';

    return 'badge bg-secondary-soft text-secondary';
  }

  /**
   * UI HELPER: Maps payment method to icons
   */
  getPaymentIcon(method: string | undefined): string {
    const m = method?.toLowerCase() || '';
    switch (m) {
      case 'cod': return 'bi-cash-stack';
      case 'upi': return 'bi-qr-code-scan';
      case 'card': return 'bi-credit-card';
      case 'net_banking':
      case 'netbanking': return 'bi-bank';
      default: return 'bi-wallet2';
    }
  }

  /**
   * UI HELPER: Maps payment method to labels
   */
  getPaymentLabel(method: string | undefined): string {
    const m = method?.toLowerCase() || '';
    if (m === 'cod') return 'Cash';
    if (m === 'net_banking' || m === 'netbanking') return 'Net Banking';
    return m ? m.toUpperCase().replace('_', ' ') : 'ONLINE';
  }

  /**
   * UI HELPER: Safe retrieval of Camera Image to avoid null pointer errors
   */
  getGearThumbnail(order: Order): string {
    return order?.Camera?.images?.[0]?.url || 'assets/no-camera.png';
  }
}