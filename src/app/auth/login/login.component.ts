import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
  // --- Signals for Data Binding ---
  email = signal<string>('');
  otp = signal<string>('');
  showOtpStep = signal<boolean>(false);

  // --- Services ---
  public loaderService = inject(LoaderService); // For <app-loader>
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private ngxService = inject(NgxUiLoaderService); // For global loader

  /**
   * Step 1: Request OTP
   */
  requestOtp() {
    if (!this.email()) {
      this.toastr.error("Please enter your email address", "Input Required", {
        toastClass: 'ngx-toastr custom-toast'
      });
      return;
    }

    this.ngxService.start();

    this.authService.requestLoginOtp(this.email()).subscribe({
      next: () => {
        this.ngxService.stop();
        this.showOtpStep.set(true);
        this.toastr.success('Verification code sent!', 'Check Email', {
          toastClass: 'ngx-toastr custom-toast'
        });
      },
      error: (err) => {
        this.ngxService.stop();
        this.toastr.error(err.error?.message || 'Failed to send OTP', 'Error', {
          toastClass: 'ngx-toastr custom-toast'
        });
      }
    });
  }

  /**
   * Step 2: Verify OTP & Login
   */
  verifyOtp() {
    if (!this.otp() || this.otp().length < 6) {
      this.toastr.error("Enter the 6-digit code", "Invalid OTP", {
        toastClass: 'ngx-toastr custom-toast'
      });
      return;
    }

    this.loaderService.start(); // Start the <app-loader>

    this.authService.verifyOtp(this.email(), this.otp()).subscribe({
      next: async (res) => {
        // Store Session Data
        if (res.user?.name) localStorage.setItem('userName', res.user.name);
        if (res.token) localStorage.setItem('token', res.token);

        // Success Animation Logic
        await this.loaderService.animateTo100();
        this.loaderService.isSuccess.set(true);

        setTimeout(() => {
          this.loaderService.reset();
          this.toastr.success('Login successful!', 'Welcome', {
            toastClass: 'ngx-toastr custom-toast'
          });
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        this.loaderService.reset();
        this.toastr.error(err.error?.message || 'Invalid code', 'Auth Failed', {
          toastClass: 'ngx-toastr custom-toast'
        });
      }
    });
  }

  goBack() {
    this.showOtpStep.set(false);
    this.otp.set('');
  }
}