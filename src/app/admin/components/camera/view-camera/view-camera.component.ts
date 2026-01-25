import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';

// Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';

// Import Service and Interfaces
import { CameraService, Camera, CameraImage } from '../../../services/camera/camera.service';

// Interface for parsed specs (Local helper)
interface CameraSpecifications {
  resolution?: string;
  sensor?: string;
  iso?: string;
  video?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-view-camera',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule
  ],
  templateUrl: './view-camera.component.html',
  styleUrls: ['./view-camera.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ViewCameraComponent implements OnInit {
  private cameraService = inject(CameraService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // Columns to display
  displayedColumns: string[] = ['image', 'name', 'brand', 'price', 'status', 'actions'];

  cameras: Camera[] = [];
  allCameras: Camera[] = []; // Backup for client-side search
  expandedElement: Camera | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadCameras();
  }

  loadCameras(): void {
    this.loading = true;
    this.cameraService.getAllCameras().subscribe({
      next: (res) => {
        // The service returns ApiResponse<Camera[]>
        const rawData = res.data || [];

        // Post-process: Parse JSON specifications if needed
        this.allCameras = rawData.map(camera => {
          let parsedSpecs = {};
          if (typeof camera.specifications === 'string') {
            try {
              parsedSpecs = JSON.parse(camera.specifications);
            } catch (e) {
              parsedSpecs = {};
            }
          } else {
            parsedSpecs = camera.specifications || {};
          }

          return {
            ...camera,
            specifications: parsedSpecs
          };
        });

        this.cameras = [...this.allCameras];
        this.loading = false;

        if (this.cameras.length === 0) {
          this.toastr.info('No cameras found in inventory.');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Failed to load cameras');
        console.error(err);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim().toLowerCase();

    if (!term) {
      this.cameras = [...this.allCameras];
      return;
    }

    this.cameras = this.allCameras.filter(camera =>
      camera.name.toLowerCase().includes(term) ||
      camera.brand.toLowerCase().includes(term) ||
      (camera.modelNumber && camera.modelNumber.toLowerCase().includes(term))
    );
  }

  /**
   * Navigate to Edit Page
   */
  editCamera(id: number): void {
    this.router.navigate(['/admin/edit-camera', id]);
  }

  /**
   * Delete Logic
   */
  deleteCamera(camera: Camera): void {
    if (!confirm(`Are you sure you want to delete "${camera.name}"? This cannot be undone.`)) {
      return;
    }

    this.loading = true; // Show loading while deleting
    this.cameraService.deleteCamera(camera.id).subscribe({
      next: () => {
        this.toastr.success('Camera deleted successfully');
        this.loadCameras(); // Reload to refresh list
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Delete failed');
      }
    });
  }

  // --- Display Helpers ---

  getPrimaryImage(camera: Camera): string {
    if (!camera.images || camera.images.length === 0) {
      return 'assets/images/placeholder-camera.jpg';
    }
    const primary = camera.images.find(img => img.isPrimary);
    return primary ? primary.url : camera.images[0].url;
  }

  handleImageError(event: any) {
    // Fallback if image fails to load
    event.target.src = 'https://placehold.co/100x100?text=No+Img';
  }

  getSpec(camera: Camera, key: string): string {
    const specs = camera.specifications as CameraSpecifications;
    return specs && specs[key] ? specs[key] : '—';
  }

  toggleRow(camera: Camera): void {
    this.expandedElement = this.expandedElement === camera ? null : camera;
  }
}