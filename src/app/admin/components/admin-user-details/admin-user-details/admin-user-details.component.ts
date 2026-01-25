import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminUserDetailsService } from '../../../services/admin-user-details/admin-user-details.service';

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-user-details.component.html',
  styleUrl: './admin-user-details.component.scss'
})
export class AdminUserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private detailsService = inject(AdminUserDetailsService);

  userData: any = null;
  loading = true;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadDetails(userId);
    }
  }

  loadDetails(id: string): void {
    this.loading = true;
    this.detailsService.getUserFullDetails(id).subscribe({
      next: (res) => {
        this.userData = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  // Returns Bootstrap utility classes for status pills
  getStatusBadgeClass(status: string): string {
    const s = status.toLowerCase();
    switch (s) {
      case 'confirmed': return 'bg-success-subtle text-success border-success';
      case 'shipped': return 'bg-info-subtle text-info border-info';
      case 'returned': return 'bg-primary-subtle text-primary border-primary';
      case 'cancelled': return 'bg-danger-subtle text-danger border-danger';
      default: return 'bg-warning-subtle text-warning border-warning';
    }
  }
}