import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin/admin.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private loader = inject(NgxUiLoaderService);

  // Form Signals
  email = signal<string>('admin@smartmedia.com');
  password = signal<string>('admin123');
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  /**
   * Main Login Handler
   */
  onLogin(): void {
    // Access signal values
    const emailVal = this.email().trim();
    const passwordVal = this.password().trim();

    // Validation
    if (!emailVal || !passwordVal) {
      this.toastr.warning('Please enter valid operator credentials', 'Validation Error');
      return;
    }

    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailVal)) {
      this.toastr.warning('Please enter a valid email address', 'Invalid Format');
      return;
    }

    // Start loading
    this.isLoading.set(true);
    this.loader.start();

    this.adminService.login({ email: emailVal, password: passwordVal }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.loader.stop();

        if (res.success) {
          this.toastr.success('Authorization Successful', 'Welcome, Admin');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.toastr.error(res.message || 'Login failed', 'Authentication Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loader.stop();

        // Extract professional error message from backend
        const msg = err.error?.message || 'Access Denied: Invalid Credentials';
        this.toastr.error(msg, 'Authentication Failed');

        console.error('Login error:', err);
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  /**
   * Handle Enter key press
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }
}