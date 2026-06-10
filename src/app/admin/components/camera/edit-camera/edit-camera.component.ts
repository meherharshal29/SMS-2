import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraImage, CameraService, Category } from '../../../services/camera/camera.service';
import { MaterialModule } from '../../../../shared/material/material.module';

interface ImageItem {
  url: string;
  file?: File;      // Present if it's a new upload
  isExisting: boolean;
}

@Component({
  selector: 'app-edit-camera',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './edit-camera.component.html',
  styleUrls: ['./edit-camera.component.scss']
})
export class EditCameraComponent implements OnInit {
handleImageError($event: ErrorEvent) {
throw new Error('Method not implemented.');
}
  private fb = inject(FormBuilder);
  private cameraService = inject(CameraService);
  private toastr = inject(ToastrService);
  private loader = inject(NgxUiLoaderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cameraForm!: FormGroup;
  cameraId!: number;
  categories: Category[] = [];

  // Single source of truth for the UI
  displayImages: ImageItem[] = [];

  isSubmitting = false;
  private readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.cameraId = Number(idParam);

    if (!this.cameraId) {
      this.toastr.error('Invalid camera ID');
      this.router.navigate(['/admin/view-cameras']);
      return;
    }

    this.initForm();
    this.loadCategories();
    this.loadCamera();
  }

  private initForm(): void {
    this.cameraForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', Validators.required],
      categoryId: [null, Validators.required],
      modelNumber: [''],
      pricePerDay: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      resolution: ['', Validators.required],
      sensor: ['', Validators.required],
      iso: ['100-51200'],
      video: ['4K 30p']
    });
  }

  private loadCategories(): void {
    this.cameraService.getCategories().subscribe({
      next: (res) => this.categories = res.data,
      error: () => this.toastr.error('Failed to load categories')
    });
  }

  loadCamera(): void {
    this.loader.start();
    this.cameraService.getCameraById(this.cameraId).subscribe({
      next: (res) => {
        const camera = res.data;

        let specs: any = {};
        try {
          specs = typeof camera.specifications === 'string'
            ? JSON.parse(camera.specifications)
            : (camera.specifications || {});
        } catch (e) { specs = {}; }

        this.cameraForm.patchValue({
          name: camera.name,
          brand: camera.brand,
          categoryId: camera.categoryId,
          modelNumber: camera.modelNumber,
          pricePerDay: camera.pricePerDay,
          description: camera.description,
          resolution: specs.resolution || '',
          sensor: specs.sensor || '',
          iso: specs.iso || '100-51200',
          video: specs.video || '4K 30p'
        });

        // Initialize display images with existing server items
        this.displayImages = (camera.images || []).map(img => ({
          url: img.url,
          isExisting: true
        }));

        this.loader.stop();
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to load camera data');
        this.router.navigate(['/admin/view-cameras']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      if (file.size > this.MAX_FILE_SIZE_BYTES) {
        this.toastr.error(`"${file.name}" is too large`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.displayImages.push({
          url: reader.result as string,
          file: file,
          isExisting: false
        });
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  removeImage(index: number): void {
    this.displayImages.splice(index, 1);
  }

  onSubmit(): void {
    if (this.cameraForm.invalid || this.displayImages.length === 0) {
      this.cameraForm.markAllAsTouched();
      this.toastr.warning('Form is invalid or images are missing');
      return;
    }

    this.isSubmitting = true;
    this.loader.start();
    const formData = new FormData();

    // Map Form Fields
    Object.keys(this.cameraForm.value).forEach(key => {
      if (['resolution', 'sensor', 'iso', 'video'].includes(key)) return;
      formData.append(key, this.cameraForm.value[key]);
    });

    // Map Specifications
    const specs = {
      resolution: this.cameraForm.value.resolution,
      sensor: this.cameraForm.value.sensor,
      iso: this.cameraForm.value.iso,
      video: this.cameraForm.value.video
    };
    formData.append('specifications', JSON.stringify(specs));

    // Handle Image Logic
    this.displayImages.forEach(img => {
      if (img.isExisting) {
        // We send the original server path back to backend
        formData.append('keepImages', img.url);
      } else if (img.file) {
        // It's a new binary file
        formData.append('images', img.file);
      }
    });

    this.cameraService.updateCamera(this.cameraId, formData).subscribe({
      next: () => {
        this.loader.stop();
        this.toastr.success('Camera updated successfully');
        this.router.navigate(['/admin/view-cameras']);
      },
      error: (err) => {
        this.loader.stop();
        this.isSubmitting = false;
        this.toastr.error(err.error?.message || 'Update failed');
      }
    });
  }
}