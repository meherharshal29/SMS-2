import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PackageService } from '../../../services/package/package.service';

@Component({
  selector: 'app-view-package',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSnackBarModule],
  templateUrl: './view-package.component.html',
  styleUrl: './view-package.component.scss'
})
export class ViewPackageComponent implements OnInit {
  packages: any[] = [];
  isLoading = true;

  private packageService = inject(PackageService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.isLoading = true;
    this.packageService.getAllPackages().subscribe({
      next: (res: any) => {
        // Handle both direct array or { data: [] } wrapper
        this.packages = Array.isArray(res) ? res : (res.data || []);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
      }
    });
  }

  deletePackage(id: string | number): void {
    if (confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      this.packageService.deletePackage(id).subscribe({
        next: () => {
          this.snackBar.open('Package deleted successfully', 'Close', { duration: 3000 });
          this.loadPackages(); // Refresh list
        },
        error: (err) => {
          this.snackBar.open('Error deleting package', 'Close', { duration: 3000 });
        }
      });
    }
  }
}