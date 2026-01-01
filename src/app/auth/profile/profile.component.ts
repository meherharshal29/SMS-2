import { Component, OnInit, inject, PLATFORM_ID, Inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, TitleCasePipe, DatePipe } from '@angular/common';
import { AuthService, User } from '../../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private toast = inject(ToastrService);
  private router = inject(Router);

  // Modern Signals for reactive state
  user = signal<User | null>(null);
  isLoading = signal<boolean>(true);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
    }
  }

  loadUserData() {
    this.isLoading.set(true);
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user.set(res.user);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.user.set(null);
        if (err.status === 401) {
          this.authService.logout();
        } else {
          this.toast.error('Failed to load profile data', 'Error', {
            toastClass: 'ngx-toastr custom-toast'
          });
        }
      }
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout() {
    this.authService.logout();
    this.toast.success('Logged out successfully', 'Auth', {
      toastClass: 'ngx-toastr custom-toast'
    });
    this.router.navigate(['/auth/login']);
  }
}