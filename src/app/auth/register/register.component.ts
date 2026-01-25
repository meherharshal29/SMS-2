import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';

import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../services/loader/loader.service';
import { LoaderComponent } from "../../components/loader/loader.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    NgxUiLoaderModule,
    LoaderComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  // --- Form State Signals ---
  name = signal<string>('');
  email = signal<string>('');
  phone = signal<string>('');
  password = signal<string>('');
  otp = signal<string>('');

  // --- UI State Signals ---
  showOtpStep = signal<boolean>(false);

  // --- Services ---
  private auth = inject(AuthService);
  private toast = inject(ToastrService);
  private router = inject(Router);
  private ngxService = inject(NgxUiLoaderService); // Background spinner
  public loaderService = inject(LoaderService);   // Full-page success loader

  /**
   * STEP 1: Initial Registration Request
   * Validates input and triggers the backend to send an OTP via email.
   */
  registerUser(): void {
    // Basic validation
    if (!this.name() || !this.email() || !this.phone() || !this.password()) {
      this.toast.error('Please complete all fields to continue');
      return;
    }

    if (this.password().length < 6) {
      this.toast.error('Password must be at least 6 characters');
      return;
    }

    // Start background loading
    this.ngxService.start();

    const payload = {
      name: this.name(),
      email: this.email(),
      phone: this.phone(),
      password: this.password()
    };

    this.auth.register(payload).subscribe({
      next: (res) => {
        this.ngxService.stop();
        this.showOtpStep.set(true); // Switch to OTP UI
        this.toast.success(`A verification code was sent to ${this.email()}`);
      },
      error: (err) => {
        this.ngxService.stop();
        this.toast.error(err.error?.message || 'Registration failed. Try again.');
      }
    });
  }

  /**
   * STEP 2: OTP Verification
   * Verifies the 6-digit code and triggers the success animation before redirect.
   */
  verifyOtp(): void {
    if (this.otp().length !== 6) {
      this.toast.error('Please enter the full 6-digit code');
      return;
    }

    // Start the premium success loader
    this.loaderService.start();

    this.auth.verifyOtp(this.email(), this.otp()).subscribe({
      next: async (res) => {
        // Handle successful verification (The AuthService tap handles token storage)

        // Success Animation Logic
        await this.loaderService.animateTo100();
        this.loaderService.isSuccess.set(true);

        // Allow user to see the success state for 1.5 seconds
        setTimeout(() => {
          this.loaderService.reset();
          this.toast.success('Your account is ready!', 'Success');
          this.router.navigate(['/auth/profile']);
        }, 1500);
      },
      error: (err) => {
        // Reset loader if verification fails
        this.loaderService.reset();
        this.toast.error(err.error?.message || 'Invalid code. Please check and try again.');
      }
    });
  }

  /**
   * Allows user to go back to Step 1 if they made a typo in their email.
   */
  goBackToDetails(): void {
    this.showOtpStep.set(false);
    this.otp.set('');
  }
}