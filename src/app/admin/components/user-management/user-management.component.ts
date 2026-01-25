import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, UpperCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router'; // Required for navigation
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AdminService, ManagedUser } from '../../services/admin/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    UpperCasePipe,
    RouterModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  public searchTerm = signal<string>('');
  public isLoading = signal<boolean>(true);

  // Computed signal: Filters users from the central Service Signal
  public filteredUsers = computed(() => {
    const allUsers = this.adminService.managedUsers();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return allUsers;
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  });

  // This signal tracks the count of users where isOnline is true
  public onlineCount = this.adminService.onlineUserCount;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    // fetchUsers() triggers the signal update inside the service
    this.adminService.fetchUsers()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        error: () => this.toastr.error('Could not fetch user directory')
      });
  }

  onToggleStatus(user: ManagedUser): void {
    const newStatus = !user.isActive;
    this.adminService.updateUser(user.id, { isActive: newStatus }).subscribe({
      next: () => this.toastr.success(`User ${newStatus ? 'Activated' : 'Deactivated'}`),
      error: () => this.toastr.error('Status update failed')
    });
  }

  onDelete(userId: number): void {
    if (confirm('Permanently remove this user? This will revoke all access.')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => this.toastr.success('User deleted successfully'),
        error: (err) => this.toastr.error(err.error?.message || 'Delete failed')
      });
    }
  }

  onNewsletter(user: ManagedUser): void {
    this.toastr.info(`Opening newsletter composer for ${user.email}`);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
}