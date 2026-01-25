import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

// Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminCallsService, CallRequest } from '../../services/admin-calls/admin-calls.service';

@Component({
  selector: 'app-admin-calls',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-calls.component.html',
  styleUrl: './admin-calls.component.scss'
})
export class AdminCallsComponent implements OnInit {
  private callService = inject(AdminCallsService);
  private toast = inject(ToastrService);

  callRequests = signal<CallRequest[]>([]);
  isLoading = signal(false);

  // Table columns
  displayedColumns: string[] = ['id', 'user', 'contact', 'subject', 'status', 'actions'];

  ngOnInit(): void {
    this.loadCalls();
  }

  loadCalls(): void {
    this.isLoading.set(true);
    this.callService.getCallRequests().subscribe({
      next: (res) => {
        this.callRequests.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load call requests');
        this.isLoading.set(false);
      }
    });
  }

  updateStatus(id: number, status: string): void {
    this.callService.updateCallStatus(id, status).subscribe({
      next: (res) => {
        this.toast.success(`Request marked as ${status}`);
        this.loadCalls(); // Refresh data
      },
      error: () => this.toast.error('Failed to update status')
    });
  }
}