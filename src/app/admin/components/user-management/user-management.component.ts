import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AdminService, ManagedUser } from '../../services/admin/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  providers: [DatePipe], // Provided for use in template if needed
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  public searchTerm = signal<string>('');
  public isLoading = signal<boolean>(true);

  // Computed signal for real-time filtering
  public filteredUsers = computed(() => {
    const allUsers = this.adminService.managedUsers();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return allUsers;
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  });

  public onlineCount = this.adminService.onlineUserCount;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.adminService.fetchUsers()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        error: () => this.toastr.error('Could not fetch user directory')
      });
  }

  onAddUser(): void {
    this.toastr.info('Opening user registration wizard...');
    // Logic for opening a modal or navigating to /admin/users/new
  }

  onToggleStatus(user: ManagedUser): void {
    const newStatus = !user.isActive;
    this.adminService.updateUser(user.id, { isActive: newStatus }).subscribe({
      next: () => this.toastr.success(`User ${newStatus ? 'Activated' : 'Banned'}`),
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
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
}