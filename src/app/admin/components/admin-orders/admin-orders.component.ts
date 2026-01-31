import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';

// Services
import { AdminService } from '../../services/admin/admin.service';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly destroy$ = new Subject<void>();

  // --- State Management (Signals) ---
  readonly allOrders = signal<any[]>([]);
  readonly isLoading = signal<boolean>(true);

  // --- Reactive Computed Logic ---
  readonly totalRevenue = computed(() =>
    this.allOrders()
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)
  );

  readonly pendingOrders = computed(() => this.allOrders().filter(o => o.status === 'pending'));
  readonly confirmedOrders = computed(() => this.allOrders().filter(o => o.status === 'confirmed'));
  readonly cancelledOrders = computed(() => this.allOrders().filter(o => o.status === 'cancelled'));

  readonly displayedColumns: string[] = ['orderId', 'client', 'gear', 'amount', 'status', 'date', 'actions'];

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- UI Helpers ---
  /**
   * Helper method to provide dynamic data for the top metric cards.
   * This resolves the NG9 error by providing the loopable array for the HTML.
   */
  getStats() {
    return [
      {
        label: 'Total Revenue',
        value: '₹' + this.totalRevenue().toLocaleString(),
        icon: 'payments',
        bgClass: 'bg-primary-light text-primary',
        borderColor: 'border-start border-primary border-4'
      },
      {
        label: 'Pending',
        value: this.pendingOrders().length,
        icon: 'hourglass_empty',
        bgClass: 'bg-warning-light text-warning',
        borderColor: 'border-start border-warning border-4'
      },
      {
        label: 'Confirmed',
        value: this.confirmedOrders().length,
        icon: 'task_alt',
        bgClass: 'bg-success-light text-success',
        borderColor: 'border-start border-success border-4'
      },
      {
        label: 'Cancelled',
        value: this.cancelledOrders().length,
        icon: 'cancel',
        bgClass: 'bg-danger-light text-danger',
        borderColor: 'border-start border-danger border-4'
      }
    ];
  }

  // --- Data Operations ---
  loadAllData(): void {
    this.isLoading.set(true);
    this.adminService.getDashboard()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res: any) => {
          this.allOrders.set(res.orders || []);
        },
        error: (err) => {
          console.error('Error fetching dashboard data:', err);
          this.isLoading.set(false);
        }
      });
  }

  updateStatus(id: number, status: string): void {
    this.adminService.updateOrderStatus(id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allOrders.update(orders =>
            orders.map(o => o.id === id ? { ...o, status } : o)
          );
        },
        error: (err) => console.error('Error updating order status:', err)
      });
  }
}