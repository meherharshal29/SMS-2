import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';

import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgxUiLoaderModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  user = {
    name: '',
    email: '',
    phone: ''
  };
  otp: string = '';
  showOtpStep: boolean = false;

  private auth = inject(AuthService);
  private toast = inject(ToastrService);
  private router = inject(Router);
  private loader = inject(NgxUiLoaderService);

  // -----------------------------------
  // Step 1 → Request OTP
  // -----------------------------------
  registerUser() {
    if (!this.user.name || !this.user.email || !this.user.phone) {
      this.toast.show('Please fill all required fields', 'error');
      return;
    }

    this.loader.start(); // Start loader

    this.auth.register(this.user).subscribe({
      next: () => {
        this.loader.stop();
        this.toast.show(`OTP sent to ${this.user.email}`, 'success');
        this.showOtpStep = true;
      },
      error: (err) => {
        this.loader.stop();
        this.toast.show(err.error?.message || 'Registration failed', 'error');
      }
    });
  }

  // -----------------------------------
  // Step 2 → Verify OTP
  // -----------------------------------
  verifyOtp() {
    if (!this.otp) {
      this.toast.show('Please enter OTP', 'error');
      return;
    }

    this.loader.start();

    this.auth.verifyOtp(this.user.email, this.otp).subscribe({
      next: (res: any) => {
        this.loader.stop();
        localStorage.setItem('token', res.token);
        localStorage.setItem('userName', res.user?.name || '');
        this.toast.show('Registration successful!', 'success');
        this.router.navigate(['/auth/profile']);
      },
      error: (err) => {
        this.loader.stop();
        this.toast.show(err.error?.message || 'Invalid OTP', 'error');
      }
    });
  }
}
