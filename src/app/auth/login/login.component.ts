import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
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
  private ngxService = inject(NgxUiLoaderService);

  /**
   * Option 1: Standard Password Login
   */
  loginWithPassword() {
    if (!this.email() || !this.password()) {
      this.toastr.error("Please enter email and password");
      return;
    }

    this.loaderService.start();
    // Using the 'login' method from the fixed AuthService
    this.authService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.handleLoginSuccess();
        }
      },
      error: (err) => {
        this.loaderService.reset();
        this.toastr.error(err.error?.message || 'Login failed');
      }
    });
  }

  /**
   * Option 2: Step 1 - Request OTP
   */
  requestOtp() {
    if (!this.email()) {
      this.toastr.error("Please enter email address");
      return;
    }

    this.ngxService.start();
    // Using the 'sendOtp' method from the fixed AuthService
    this.authService.sendOtp(this.email()).subscribe({
      next: (res) => {
        this.ngxService.stop();
        if (res.success) {
          this.showOtpInput.set(true);
          this.toastr.success('OTP sent to your email');
        }
      },
      error: (err) => {
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

    this.loaderService.start();
    this.authService.verifyOtp(this.email(), this.otp()).subscribe({
      next: (res) => {
        if (res.success) {
          this.handleLoginSuccess();
        }
      },
      error: (err) => {
        this.loaderService.reset();
        this.toastr.error(err.error?.message || 'Invalid OTP');
      }
    });
  }

  /**
   * Unified Success Handler
   * This ensures the user is navigated only AFTER the state is fully saved
   */
  private async handleLoginSuccess() {
    await this.loaderService.animateTo100();
    this.loaderService.isSuccess.set(true);

    setTimeout(() => {
      this.loaderService.reset();
      this.toastr.success('Welcome back!');

      // Check for returnUrl or default to home
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

      // Ensure state is synced before navigation
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
  }
}