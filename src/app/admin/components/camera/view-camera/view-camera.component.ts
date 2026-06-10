import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

// Material Core UI Blocks Modules
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// Service & Model Contracts Mappings
import { CameraService, Camera } from '../../../services/camera/camera.service';

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
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './view-camera.component.html',
  styleUrls: ['./view-camera.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ViewCameraComponent implements OnInit, OnDestroy {
  private readonly cameraService = inject(CameraService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Layout Columns Config Table Mappings
  readonly displayedColumns: string[] = ['image', 'name', 'brand', 'price', 'status', 'actions'];

  cameras: Camera[] = [];
  allCameras: Camera[] = [];
  expandedElement: Camera | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadCameras();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCameras(): void {
    this.loading = true;
    this.cameraService.getAllCameras()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const rawData = res.data || [];

          // Parse specification strings into JSON objects
          this.allCameras = rawData.map(camera => {
            let parsedSpecs: CameraSpecifications = {};
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
              isNew: this.checkIfRecent(camera.createdAt),
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
          this.toastr.error('Failed to load cameras from production environment servers.');
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

  editCamera(id: number): void {
    this.router.navigate(['/admin/edit-camera', id]);
  }

  deleteCamera(camera: Camera): void {
    if (!confirm(`Are you sure you want to delete "${camera.name}"? This cannot be undone.`)) {
      return;
    }

    this.loading = true;
    this.cameraService.deleteCamera(camera.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Camera asset deleted successfully');
          this.loadCameras();
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error(err.error?.message || 'Delete operation failed.');
        }
      });
  }

  getPrimaryImage(camera: Camera): string {
    if (!camera.images || camera.images.length === 0) {
      return 'assets/images/placeholder-camera.jpg';
    }
    const primary = camera.images.find(img => img.isPrimary);
    return primary ? primary.url : camera.images[0].url;
  }

  handleImageError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = 'https://placehold.co/100x100?text=No+Img';
  }

  getSpec(camera: Camera, key: string): string {
    const specs = camera.specifications as CameraSpecifications;
    return specs && specs[key] ? specs[key] : '—';
  }

  toggleRow(camera: Camera): void {
    this.expandedElement = this.expandedElement === camera ? null : camera;
  }

  private checkIfRecent(dateString?: string): boolean {
    if (!dateString) return false;
    const diffInMinutes = (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60);
    return diffInMinutes < 5;
  }
}