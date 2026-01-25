import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Material Imports
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PackageService } from '../../services/package/package.service';
import { BookingService } from '../../services/booking/booking.service'; // Separate Service
import { FooterComponent } from "../../common/footer/footer.component";

@Component({
  selector: 'app-book-shoot',
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatInputModule,
    MatFormFieldModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule,
    MatProgressSpinnerModule, FooterComponent
  ],
  templateUrl: './book-shoot.component.html',
  styleUrls: ['./book-shoot.component.scss']
})
export class BookShootComponent implements OnInit {
  bookingForm!: FormGroup;
  selectedPackage: any = null;
  isLoading = true;
  isSubmitting = false;
  minDate = new Date();

  private fb = inject(FormBuilder);
  private packageService = inject(PackageService);
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.initForm(id);
      this.loadPackage(id);
    } else {
      this.router.navigate(['/packages']);
    }
  }

  initForm(packageId: string) {
    this.bookingForm = this.fb.group({
      packageId: [packageId, Validators.required],
      eventDate: ['', Validators.required],
      eventLocation: ['', [Validators.required, Validators.minLength(5)]],
      specialRequirements: ['']
    });
  }

  loadPackage(id: string) {
    this.packageService.getPackageById(id).subscribe({
      next: (res: any) => {
        this.selectedPackage = res.data || res;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error loading package details', 'Close', { duration: 3000 });
        this.router.navigate(['/packages']);
      }
    });
  }

  onSubmit() {
    if (this.bookingForm.invalid) return;

    this.isSubmitting = true;

    // Formatting date for Sequelize DATEONLY (YYYY-MM-DD)
    const rawDate = this.bookingForm.value.eventDate;
    const formattedDate = this.datePipe.transform(rawDate, 'yyyy-MM-dd');

    const payload = {
      ...this.bookingForm.value,
      eventDate: formattedDate
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Booking Request Sent Successfully!', 'Success', { duration: 5000 });
        this.router.navigate(['/my-bookings']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(err.message || 'Booking failed', 'Close', { duration: 4000 });
      }
    });
  }
}