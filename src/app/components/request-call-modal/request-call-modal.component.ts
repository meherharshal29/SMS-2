import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessageService } from '../../services/message/message.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

/**
 * Interface for Inquiry Category
 */
interface InquiryCategory {
  value: string;
  label: string;
  icon: string;
  description: string;
}

/**
 * Request Call Modal Component
 * 
 * A professional, responsive modal for requesting callbacks with:
 * - Welcome view with trust indicators
 * - Category selection form
 * - Success confirmation view
 * 
 * Fully responsive for mobile, tablet, and desktop devices
 */
@Component({
  selector: 'app-request-call-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './request-call-modal.component.html',
  styleUrl: './request-call-modal.component.scss'
})
export class RequestCallModalComponent implements OnInit {
  // Dependency Injection
  private dialogRef = inject(MatDialogRef<RequestCallModalComponent>);
  private messageService = inject(MessageService);
  private auth = inject(AuthService);
  private toast = inject(ToastrService);

  // Component States
  showForm = false;
  isSubmitting = false;
  isSubmitted = false;
  selectedCategory = '';

  // Inquiry categories with icons and descriptions
  inquiryCategories: InquiryCategory[] = [
    {
      value: 'rental_camera',
      label: 'Rental Camera',
      icon: '📷',
      description: 'Professional camera rental services'
    },
    {
      value: 'photoshoot',
      label: 'Photoshoot Booking',
      icon: '📸',
      description: 'Book professional photoshoot sessions'
    },
    {
      value: 'general',
      label: 'General Inquiry',
      icon: '💬',
      description: 'Other questions and feedback'
    }
  ];

  /**
   * Lifecycle hook - Component initialization
   * Verifies user authentication status
   */
  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.error('Session expired. Please log in again.', 'Unauthorized');
      this.close();
    }
  }

  /**
   * Close the modal dialog
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * Show the inquiry form view
   */
  showInquiryForm(): void {
    this.showForm = true;
  }

  /**
   * Go back to the initial welcome view
   */
  goBack(): void {
    this.showForm = false;
    this.selectedCategory = '';
  }

  /**
   * Select a category
   * @param categoryValue - The value of the selected category
   */
  selectCategory(categoryValue: string): void {
    if (!this.isSubmitting) {
      this.selectedCategory = categoryValue;
    }
  }

  /**
   * Get the selected category details
   * @returns The selected InquiryCategory object or undefined
   */
  getSelectedCategory(): InquiryCategory | undefined {
    return this.inquiryCategories.find(cat => cat.value === this.selectedCategory);
  }

  /**
   * Submit the callback request
   * Validates selection, sends request to backend, and handles response
   */
  submitRequest(): void {
    // Validation
    if (!this.selectedCategory) {
      this.toast.warning('Please select an inquiry type.', 'Selection Required');
      return;
    }

    // Prevent double submission
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const payload = { subject: this.selectedCategory };

    this.messageService.requestCallback(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          // Switch to the Success View
          this.isSubmitted = true;

          // Show success toast
          this.toast.success(
            'Your callback request has been submitted successfully.',
            'Request Submitted'
          );

          // Auto-close after 3.5 seconds
          setTimeout(() => {
            this.close();
          }, 3500);
        },
        error: (err) => {
          // Handle error response
          const errorMsg = err.error?.message || 'Unable to process your request. Please try again later.';
          this.toast.error(errorMsg, 'Request Failed');

          console.error('Callback request error:', err);
        }
      });
  }
}