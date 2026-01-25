import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Booking, BookingService } from '../../../services/booking/booking.service';
import { MatDivider } from "@angular/material/divider";
import { MatProgressBar } from "@angular/material/progress-bar";

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatChipsModule, MatSnackBarModule, MatTooltipModule,
    MatDivider,
    MatProgressBar
],
  templateUrl: './admin-booking.component.html',
  styleUrls: ['./admin-booking.component.scss']
})
export class AdminBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private snackBar = inject(MatSnackBar);

  bookings: Booking[] = [];
  isLoading = true;
  displayedColumns: string[] = ['client', 'package', 'event', 'status', 'actions'];

  ngOnInit(): void {
    this.loadAllBookings();
  }

  loadAllBookings(): void {
    this.isLoading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        if (res.success) {
          // Show newest bookings first
          this.bookings = res.data.sort((a, b) => b.id - a.id);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Error loading bookings', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  updateStatus(id: number, status: string): void {
    this.bookingService.updateBookingStatus(id, status).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || `Status updated to ${status}`, 'Success', { duration: 3000 });
        this.loadAllBookings(); // Refresh data
      },
      error: (err) => this.snackBar.open(err.message || 'Update failed', 'Error')
    });
  }

  onDelete(id: number): void {
    if (confirm('Delete this booking record? This cannot be undone.')) {
      this.bookingService.deleteBooking(id).subscribe({
        next: (res) => {
          this.snackBar.open(res.message || 'Record deleted', 'OK');
          this.bookings = this.bookings.filter(b => b.id !== id);
        },
        error: (err) => this.snackBar.open(err.message, 'Error')
      });
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    return `status-${status.toLowerCase()}`;
  }
}