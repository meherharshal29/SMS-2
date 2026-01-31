import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '../../../services/booking/booking.service';
import { MaterialModule } from '../../../../shared/material/material.module';
import { Component, OnInit, inject, signal, computed } from '@angular/core';

// Define strict Status type
export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  id: number;
  status: BookingStatus;
  eventDate: string;
  eventLocation: string;
  specialRequirements?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  package?: {
    title: string;
    price: number;
    coverImage: string;
  };
}

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './admin-booking.component.html',
  styleUrls: ['./admin-booking.component.scss']
})
export class AdminBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private snackBar = inject(MatSnackBar);

  // --- Reactive State Management ---
  private _bookings = signal<Booking[]>([]);
  public isLoading = signal<boolean>(true);

  // Publicly exposed signals for the template
  public bookings = computed(() => this._bookings());
  public onlineCount = computed(() => this._bookings().length); // Example of computed value

  public displayedColumns: string[] = ['client', 'package', 'event', 'status', 'actions'];

  ngOnInit(): void {
    this.loadAllBookings();
  }

  /**
   * Loads bookings from the server and sanitizes the data structure
   * to prevent TS2322 assignment errors.
   */
  loadAllBookings(): void {
    this.isLoading.set(true);
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          const sanitized: Booking[] = res.data.map((b: any) => ({
            id: b.id,
            user: {
              name: b.user?.name || 'N/A',
              email: b.user?.email || 'N/A',
              phone: b.user?.phone || 'N/A'
            },
            package: {
              title: b.package?.title || 'Unknown Package',
              price: b.package?.price || 0,
              coverImage: b.package?.coverImage || ''
            },
            eventDate: b.eventDate,
            eventLocation: b.eventLocation,
            specialRequirements: b.specialRequirements, // Added missing mapping
            status: b.status as BookingStatus,
          }));

          // Sort by ID descending (newest first)
          this._bookings.set(sanitized.sort((a, b) => b.id - a.id));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.message || 'Failed to load bookings';
        this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Updates booking status with optimistic UI update
   */
  updateStatus(id: number, status: BookingStatus): void {
    this.bookingService.updateBookingStatus(id, status).subscribe({
      next: (res) => {
        this.snackBar.open(`Booking #${id} updated to ${status}`, 'Success', { duration: 2000 });

        // Optimistic Update: Update local signal immediately
        this._bookings.update(list =>
          list.map(b => b.id === id ? { ...b, status } : b)
        );
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Update failed';
        this.snackBar.open(errorMsg, 'Error', { duration: 3000 });
      }
    });
  }

  /**
   * Helper for CSS class binding
   */
  getStatusClass(status: string): string {
    return `status-${status?.toLowerCase() || 'pending'}`;
  }
}