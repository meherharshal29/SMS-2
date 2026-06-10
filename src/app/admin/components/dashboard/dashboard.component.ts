import { Component, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, DecimalPipe, UpperCasePipe, isPlatformBrowser } from '@angular/common';
import { Subject, finalize, takeUntil } from 'rxjs';
import { AdminService } from '../../services/admin/admin.service';
import { CameraService } from '../../services/camera/camera.service';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, UpperCasePipe, MaterialModule],
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

  /* --- Signals (State) --- */
  readonly adminUser = this.adminService.currentAdmin;
  readonly stats = this.adminService.dashboardStats;
  private _ordersRaw = signal<any[]>([]);

  readonly totalCameras = signal<number>(0);
  readonly isLoading = signal<boolean>(true);
  readonly isUpdating = signal<boolean>(false);
  readonly highlightedOrderId = signal<number | null>(null);

  /* --- Computed Logic --- */
  readonly recentOrders = computed(() => this._ordersRaw().slice(0, 10));
  readonly totalOrdersCount = computed(() => this._ordersRaw().length);

  // Financial Badges
  readonly monthlyRevenue = computed(() => this.stats()?.monthlyRevenue || 0);

  // Logistics Badges
  readonly deliveredCount = computed(() => this.stats()?.rentals?.delivered || 0);
  readonly cancelledOrdersCount = computed(() => this.stats()?.rentals?.cancelled || 0);

  // Layout Columns Config Table Mappings
  readonly displayedColumns: string[] = ['select', 'gear', 'client', 'payment', 'amount', 'status', 'complete', 'actions'];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.notificationSound = new Audio('assets/sounds/notification.mp3');
    }
  }

  ngOnInit(): void {
    this.refreshAllData();
    this.fetchCameraCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* --- Data Operations --- */

  refreshAllData(): void {
    this.isLoading.set(true);
    this.adminService.getDashboard()
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading.set(false)))
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
        }
      });
  }

  toggleComplete(orderId: number, event: any): void {
    const newStatus = event.checked ? 'delivered' : 'confirmed';
    this.updateStatus(orderId, newStatus);
  }

  updateStatus(orderId: number, status: string): void {
    const normalizedStatus = status.toLowerCase();
    this.isUpdating.set(true);

    this.adminService.updateOrderStatus(orderId, normalizedStatus)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this._ordersRaw.update(orders =>
              orders.map(o => o.id === orderId ? { ...o, status: normalizedStatus } : o)
            );
            this.triggerFlash(orderId);
            if (normalizedStatus === 'delivered' || normalizedStatus === 'returned') {
              this.playAlert();
            }
          }
        }
      });
  }

  /* --- UI Helpers --- */

  getStatusClass(status: string): string {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'delivered': return 'status-delivered';
      case 'returned': return 'status-returned'; // Added Style Modifier mapping for returns
      case 'shipped': return 'status-shipped';
      case 'confirmed':
      case 'confirm': return 'status-confirmed';
      case 'cancel':
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getPaymentIcon(method: string): string {
    const m = method?.toLowerCase() || '';
    switch (m) {
      case 'cod': return 'payments';
      case 'upi': return 'qr_code_2';
      case 'card': return 'credit_card';
      case 'net_banking':
      case 'netbanking': return 'account_balance';
      default: return 'help_outline';
    }
  }

  getPaymentLabel(method: string): string {
    const m = method?.toLowerCase() || '';
    return m === 'cod' ? 'CASH' : m.toUpperCase().replace('_', ' ');
  }

  private resolveImages(camera: any) {
    if (!camera?.images) return camera;
    return {
      ...camera,
      images: camera.images.map((img: any) => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `${this.backendUrl}/${img.url.replace(/\\/g, '/')}`
      }))
    };
  }

  private triggerFlash(id: number): void {
    this.highlightedOrderId.set(id);
    setTimeout(() => this.highlightedOrderId.set(null), 2000);
  }

  private checkIfRecent(date: string): boolean {
    if (!date) return false;
    const diff = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60);
    return diff < 5;
  }

  private playAlert(): void {
    this.notificationSound?.play().catch(() => { });
  }

  fetchCameraCount(): void {
    this.cameraService.getAllCameras().subscribe(res => {
      if (res.success) this.totalCameras.set(res.data.length);
    });
  }

  exportToCSV(): void {
    const orders = this._ordersRaw();
    const headers = 'ID,Asset,Client,Payment,Price,Status,Date\n';
    const rows = orders.map(o =>
      `${o.id},"${o.Camera?.name}","${o.user?.name}","${o.paymentMethod?.toUpperCase()}",${o.totalPrice},${o.status.toUpperCase()},${o.createdAt}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Logistics_Report_${new Date().getTime()}.csv`;
    link.click();
  }
}