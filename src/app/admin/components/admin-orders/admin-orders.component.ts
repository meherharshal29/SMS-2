import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin/admin.service';

// Material
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
    MatTableModule, MatCardModule, MatIconModule,
    MatButtonModule, MatTooltipModule, MatMenuModule, MatDividerModule
  ],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);

  // States
  allOrders = signal<any[]>([]);
  isLoading = signal(true);

  // Computed Stats (Reactive)
  totalRevenue = computed(() =>
    this.allOrders()
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)
  );

  pendingOrders = computed(() => this.allOrders().filter(o => o.status === 'pending'));
  confirmedOrders = computed(() => this.allOrders().filter(o => o.status === 'confirmed'));
  cancelledOrders = computed(() => this.allOrders().filter(o => o.status === 'cancelled'));

  displayedColumns: string[] = ['orderId', 'client', 'gear', 'amount', 'status', 'date', 'actions'];

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading.set(true);
    this.adminService.getDashboard().subscribe({
      next: (res) => {
        this.allOrders.set(res.orders || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateStatus(id: number, status: string) {
    this.adminService.updateOrderStatus(id, status).subscribe(() => {
      this.allOrders.update(orders =>
        orders.map(o => o.id === id ? { ...o, status } : o)
      );
    });
  }
}