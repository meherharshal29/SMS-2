import { Component, OnInit, inject, signal, computed, DestroyRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, finalize, of } from 'rxjs';

// Services
import { OrderService, Order } from '../../services/order/order.service';
import { BookingService, Booking } from '../../services/booking/booking.service';
import { FooterComponent } from "../../common/footer/footer.component";

// UI
import { NgxUiLoaderService, NgxUiLoaderModule } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { MatIcon } from "@angular/material/icon";
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FooterComponent],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private bookingService = inject(BookingService);
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID); // Fixed: Inject Platform ID

  // --- State ---
  orders = signal<Order[]>([]);
  bookings = signal<Booking[]>([]);
  isLoading = signal<boolean>(false);

  // --- Computed Stats (Merged) ---
  totalSpent = computed(() => {
    const gearTotal = this.orders()
      .filter(o => ['delivered', 'confirmed', 'shipped', 'completed'].includes(o.status?.toLowerCase()))
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
    // Fixed: Only run data fetching in the browser to avoid localStorage errors
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllFinancialData();
    }
  }

  loadAllFinancialData(): void {
    this.isLoading.set(true);
    this.loader.start();

    forkJoin({
      gear: this.orderService.getMyOrders().pipe(finalize(() => { })),
      shoots: this.bookingService.getMyBookings().pipe(finalize(() => { }))
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.isLoading.set(false);
        this.loader.stop();
      })
    ).subscribe({
      next: (res) => {
        this.orders.set(res.gear || []);
        // Safely check if shoots data exists before setting
        this.bookings.set(res.shoots?.data || []);
      },
      error: (err) => {
        this.toastr.error('Failed to sync financial records.');
        console.error('Financial sync error:', err);
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'badge bg-secondary-soft text-secondary';
    const s = status.toLowerCase();
    if (['confirmed', 'shipped', 'delivered', 'completed'].includes(s)) return 'badge bg-success-soft text-success';
    if (s === 'pending') return 'badge bg-warning-soft text-warning';
    if (s === 'cancelled') return 'badge bg-danger-soft text-danger';
    return 'badge bg-secondary-soft text-secondary';
  }
}