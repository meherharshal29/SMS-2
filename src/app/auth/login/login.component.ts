import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader'; // Import Service
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../services/loader/loader.service';
import { LoaderComponent } from "../../components/loader/loader.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgxUiLoaderModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // --- Signals ---
  email = signal<string>('');
  password = signal<string>('');
  otp = signal<string>('');

  // Toggles: 'password' | 'otp'
  loginMode = signal<'password' | 'otp'>('password');
  showOtpInput = signal<boolean>(false);

  // --- Services ---
  public loaderService = inject(LoaderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private ngxService = inject(NgxUiLoaderService); // Primary loader service

  /**
   * Option 1: Standard Password Login
   */
  loginWithPassword() {
    if (!this.email() || !this.password()) {
      this.toastr.error("Please enter email and password");
      return;
    }

    // Start UI Loader
    this.ngxService.start();

    this.authService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (res) => {
        this.ngxService.stop(); // Stop loader on success
        if (res.success) {
          this.handleLoginSuccess();
        }
      },
      error: (err) => {
        this.ngxService.stop(); // Stop loader on error
        this.toastr.error(err.error?.message || 'Login failed');
      }
    });
  }

  /**
   * Option 2: Step 1 - Request OTP
   * The loader starts when button is clicked and stops after API response
   */
  requestOtp() {
    if (!this.email()) {
      this.toastr.error("Please enter email address");
      return;
    }

    // --- START LOADER ---
    this.ngxService.start();

    this.authService.sendOtp(this.email()).subscribe({
      next: (res) => {
        // --- STOP LOADER ON SUCCESS ---
        this.ngxService.stop();

        if (res.success) {
          this.showOtpInput.set(true);
          this.toastr.success('Verification code sent to ' + this.email());
        }
      },
      error: (err) => {
        // --- STOP LOADER ON ERROR ---
        this.ngxService.stop();

        this.toastr.error(err.error?.message || 'Failed to send OTP');
      }
    });
  }

  /**
   * Option 2: Step 2 - Verify OTP
   */
  verifyOtp() {
    if (this.otp().length !== 6) {
      this.toastr.error("Enter 6-digit code");
      return;
    }

    // Start UI Loader
    this.ngxService.start();

    this.authService.verifyOtp(this.email(), this.otp()).subscribe({
      next: (res) => {
        this.ngxService.stop(); // Stop loader on success
        if (res.success) {
          this.handleLoginSuccess();
        }
      },
      error: (err) => {
        this.ngxService.stop(); // Stop loader on error
        this.toastr.error(err.error?.message || 'Invalid OTP');
      }
    });
  }

  /**
   * Unified Success Handler
   */
  private async handleLoginSuccess() {
    // Optional: Using your custom overlay loader for the final transition
    this.loaderService.start();
    await this.loaderService.animateTo100();
    this.loaderService.isSuccess.set(true);

    setTimeout(() => {
      this.loaderService.reset();
      this.toastr.success('Welcome back!');

      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

      this.authService.syncProfile().subscribe(() => {
        this.router.navigateByUrl(returnUrl);
      });
    }, 1500);
  }

  toggleMode(mode: 'password' | 'otp') {
    this.loginMode.set(mode);
    this.showOtpInput.set(false);
    this.password.set('');
    this.otp.set('');
    // Ensure loader is stopped if user switches tabs
    this.ngxService.stop();
  }
}