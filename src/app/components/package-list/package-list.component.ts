import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FooterComponent } from "../../common/footer/footer.component";
import { Package, PackageService } from '../../services/package/package.service';
import { RequestCallModalComponent } from '../request-call-modal/request-call-modal.component';

@Component({
  selector: 'app-package-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, MatDialogModule],
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss']
})
export class PackageListComponent implements OnInit {
  packages: Package[] = [];
  isLoading = true;
  activeCategory = 'All';

  // Inject dependencies
  private platformId = inject(PLATFORM_ID);
  private dialog = inject(MatDialog);
  private packageService = inject(PackageService);

  categories = [
    'All', 'Wedding', 'Pre-Wedding', 'Engagement', 'Maternity',
    'Newborn', 'Kids & Baby', 'Birthday', 'Anniversary',
    'House Warming', 'Corporate Event', 'Conference',
    'Product Photography', 'Food & Beverage', 'Architecture',
    'Real Estate', 'Fashion/Model Shoot', 'Portfolio',
    'Short Film', 'Music Video', 'AD Film', 'Documentary', 'Other'
  ];

  ngOnInit(): void {
    this.fetchPackages('All');

    // Trigger Callback Modal only in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.triggerCallbackModal();
    }
  }

  triggerCallbackModal() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        // Check if any dialog is already open to prevent duplicates
        if (this.dialog.openDialogs.length === 0) {
          this.dialog.open(RequestCallModalComponent, {
            width: '450px',
            maxWidth: '95vw',        // Better for mobile stability
            disableClose: false,
            panelClass: 'custom-modal-box', // Matches our CSS above
            autoFocus: false,        // Prevents page jumping to focus inputs
            backdropClass: 'custom-backdrop' // For custom blur if desired
          });
        }
      }, 5000);
    }
  }

  filterPackages(category: string) {
    this.activeCategory = category;
    this.fetchPackages(category);
  }

  fetchPackages(category: string) {
    this.isLoading = true;

    // FIX: window is only available in the browser
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.packageService.getActivePackages(category).subscribe({
      next: (res: any) => {
        this.packages = Array.isArray(res) ? res : (res.data || []);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching packages:', err);
        this.packages = [];
        this.isLoading = false;
      }
    });
  }
}