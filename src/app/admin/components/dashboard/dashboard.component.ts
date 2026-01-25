import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
  PLATFORM_ID
} from '@angular/core';
import {
  CommonModule,
  DecimalPipe,
  UpperCasePipe,
  isPlatformBrowser
} from '@angular/common';
import { Subject, finalize, takeUntil } from 'rxjs';

// Services
import { AdminService } from '../../services/admin/admin.service';
import { CameraService } from '../../services/camera/camera.service';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    UpperCasePipe,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Service Injection
  private readonly adminService = inject(AdminService);
  private readonly cameraService = inject(CameraService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$ = new Subject<void>();

  // Configuration
  private readonly backendUrl = 'http://localhost:5000';
  private notificationSound?: HTMLAudioElement;

  /* ==========================================================================
      STATE MANAGEMENT (SIGNALS)
     ========================================================================== */
  readonly adminUser = this.adminService.currentAdmin;
  readonly stats = this.adminService.dashboardStats;

  private _ordersRaw = signal<any[]>([]);
  readonly totalCameras = signal<number>(0);
  readonly isLoading = signal<boolean>(true);
  readonly isUpdating = signal<boolean>(false);

  // Animation Signal: ID of row to flash yellow on update or new arrival
  readonly highlightedOrderId = signal<number | null>(null);

  /* ==========================================================================
      REACTIVE COMPUTED LOGIC
     ========================================================================== */

  // Limits the view to the 10 most recent entries in the table
  readonly recentOrders = computed(() => this._ordersRaw().slice(0, 10));

  // Reactive count of all orders in the system
  readonly totalOrdersCount = computed(() => this._ordersRaw().length);

  // Material Table Column Definition
  readonly displayedColumns: string[] = [
    'select',
    'gear',
    'client',
    'amount',
    'status',
    'complete',
    'actions'
  ];

  /* ==========================================================================
      REAL-TIME PUSH HANDLING (CONSTRUCTOR)
     ========================================================================== */
  constructor() {
    // Initialize sound safely for SSR
    if (isPlatformBrowser(this.platformId)) {
      this.notificationSound = new Audio('assets/sounds/notification.mp3');
    }
  }

  /* ==========================================================================
      LIFECYCLE HOOKS
     ========================================================================== */
  ngOnInit(): void {
    this.refreshAllData();
    this.fetchCameraCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ==========================================================================
      DATA OPERATIONS
     ========================================================================== */

  refreshAllData(): void {
    this.isLoading.set(true);
    this.adminService.getDashboard()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.orders) {
            const processed = res.orders.map((o: any) => ({
              ...o,
              isNew: this.checkIfRecent(o.createdAt),
              Camera: this.resolveImages(o.Camera)
            }));
            this._ordersRaw.set(processed);
          }
        },
        error: (err) => console.error('Error fetching dashboard data:', err)
      });
  }

  private handleRealTimeIncoming(order: any): void {
    // Check if order already exists to prevent duplicates from socket/REST overlap
    const exists = this._ordersRaw().some(o => o.id === order.id);
    if (exists) return;

    const processed = {
      ...order,
      isNew: true, // Triggers the Blinking Green Dot UI
      Camera: this.resolveImages(order.Camera)
    };

    // Push new order to the start of the signal array
    this._ordersRaw.update(prev => [processed, ...prev]);

    // Play sound and trigger the UI flash
    this.playAlert();
    this.triggerFlash(order.id);
  }

  /**
   * Automatic Fulfillment Toggle (Delivered <-> Confirmed)
   */
  toggleComplete(orderId: number, event: any): void {
    const newStatus = event.checked ? 'delivered' : 'confirmed';
    this.updateStatus(orderId, newStatus);
  }

  updateStatus(orderId: number, status: string): void {
    this.isUpdating.set(true);
    this.adminService.updateOrderStatus(orderId, status)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isUpdating.set(false))
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            // Optimistic Local Update for smooth UI
            this._ordersRaw.update(orders =>
              orders.map(o => o.id === orderId ? { ...o, status } : o)
            );
            this.triggerFlash(orderId);
          }
        },
        error: (err) => console.error('Error updating order status:', err)
      });
  }


  // 2. Total Cancelled Orders
  readonly cancelledOrdersCount = computed(() =>
    this._ordersRaw().filter(o => o.status === 'cancelled').length
  );
  /* ==========================================================================
      UI HELPERS
     ========================================================================== */

  private triggerFlash(id: number): void {
    this.highlightedOrderId.set(id);
    setTimeout(() => {
      // Clean up "isNew" flag and highlight after animation finishes
      this._ordersRaw.update(orders =>
        orders.map(o => o.id === id ? { ...o, isNew: false } : o)
      );
      this.highlightedOrderId.set(null);
    }, 2500);
  }

  private checkIfRecent(date: string): boolean {
    if (!date) return false;
    const diff = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60);
    return diff < 5; // Newer than 5 minutes
  }

  private playAlert(): void {
    if (this.notificationSound) {
      this.notificationSound.play().catch(() => {
        console.warn('Audio blocked. Interaction required.');
      });
    }
  }

  private resolveImages(camera: any) {
    if (!camera) return null;
    return {
      ...camera,
      images: camera.images?.map((img: any) => ({
        ...img,
        url: img.url.startsWith('http')
          ? img.url
          : `${this.backendUrl}/${img.url.replace(/\\/g, '/')}`
      }))
    };
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s.includes('deliver')) return 'status-delivered';
    if (s.includes('confirm')) return 'status-confirmed';
    if (s.includes('cancel')) return 'status-cancelled';
    if (s.includes('ship')) return 'status-shipped';
    return 'status-pending';
  }

  fetchCameraCount(): void {
    this.cameraService.getAllCameras()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) this.totalCameras.set(res.data.length);
        }
      });
  }

  exportToCSV(): void {
    const orders = this._ordersRaw();
    const headers = 'ID,Asset,Client,Price,Status\n';
    const rows = orders.map(o =>
      `${o.id},"${o.Camera?.name || 'N/A'}","${o.user?.name || 'N/A'}",${o.totalPrice},${o.status}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    if (isPlatformBrowser(this.platformId)) {
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `logistics-report-${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up memory
    }
  }
}