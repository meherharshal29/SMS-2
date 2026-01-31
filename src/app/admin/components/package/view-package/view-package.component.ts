import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, finalize } from 'rxjs';

// Services
import { PackageService } from '../../../services/package/package.service';
// Modules (Assumes you have a shared MaterialModule or import individually)
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-view-package',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    DecimalPipe
  ],
  templateUrl: './view-package.component.html',
  styleUrl: './view-package.component.scss'
})
export class ViewPackageComponent implements OnInit, OnDestroy {
  packages: any[] = [];
  isLoading = true;
  isUpdating = false; // Property added to resolve NG9 error

  private readonly destroy$ = new Subject<void>();
  private packageService = inject(PackageService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadPackages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPackages(): void {
    this.isLoading = true;
    this.packageService.getAllPackages()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res: any) => {
          this.packages = Array.isArray(res) ? res : (res.data || []);
        },
        error: (err) => {
          console.error('Error loading packages:', err);
          this.snackBar.open('Failed to sync gallery metadata.', 'Close', { duration: 3000 });
        }
      });
  }

  deletePackage(id: string | number): void {
    if (confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      this.isUpdating = true; // Trigger global overlay feedback
      this.packageService.deletePackage(id)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isUpdating = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Package deleted successfully', 'Close', { duration: 3000 });
            this.loadPackages();
          },
          error: (err) => {
            console.error('Error deleting package:', err);
            this.snackBar.open('Error deleting package', 'Close', { duration: 3000 });
          }
        });
    }
  }
}