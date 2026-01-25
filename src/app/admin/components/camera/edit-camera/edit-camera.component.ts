import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select'; // Added for Category selection
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraImage, CameraService, Category, ApiResponse } from '../../../services/camera/camera.service';

@Component({
  selector: 'app-edit-camera',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './edit-camera.component.html',
  styleUrls: ['./edit-camera.component.scss']
})
export class EditCameraComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cameraService = inject(CameraService);
  private toastr = inject(ToastrService);
  private loader = inject(NgxUiLoaderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cameraForm!: FormGroup;
  cameraId!: number;
  categories: Category[] = [];

  imagePreviews: string[] = [];
  existingImageUrls: string[] = [];
  newSelectedFiles: File[] = [];

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
      categoryId: [null, Validators.required], // Added category support
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
      next: (res: ApiResponse<Camera> | any) => {
        // Handle both direct Camera object or ApiResponse wrapper
        const camera = res.data ? res.data : res;

        let specs: any = {};
        if (camera.specifications) {
          specs = typeof camera.specifications === 'string'
            ? JSON.parse(camera.specifications)
            : camera.specifications;
        }

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

        this.existingImageUrls = camera.images?.map((img: CameraImage) => img.url) || [];
        this.imagePreviews = [...this.existingImageUrls];
        this.loader.stop();
      },
      error: (err) => {
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
        this.toastr.error(`"${file.name}" exceeds 10MB`);
        return;
      }
      this.newSelectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.imagePreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  removeImage(index: number): void {
    const previewToRemove = this.imagePreviews[index];
    this.imagePreviews.splice(index, 1);

    // If removing an existing image from server
    const existingIdx = this.existingImageUrls.indexOf(previewToRemove);
    if (existingIdx !== -1) {
      this.existingImageUrls.splice(existingIdx, 1);
    } else {
      // If removing a newly selected file
      // Calculate index by checking how many "new" previews came before this one
      const newFileIndex = index - this.existingImageUrls.length;
      if (newFileIndex >= 0) {
        this.newSelectedFiles.splice(newFileIndex, 1);
      }
    }
  }

  onSubmit(): void {
    if (this.cameraForm.invalid || this.imagePreviews.length === 0) {
      this.cameraForm.markAllAsTouched();
      this.toastr.warning('Please complete the form and add images');
      return;
    }

    this.isSubmitting = true;
    this.loader.start();
    const formData = new FormData();

    // Text fields
    formData.append('name', this.cameraForm.value.name.trim());
    formData.append('brand', this.cameraForm.value.brand.trim());
    formData.append('categoryId', this.cameraForm.value.categoryId);
    formData.append('pricePerDay', this.cameraForm.value.pricePerDay);
    formData.append('description', this.cameraForm.value.description.trim());
    if (this.cameraForm.value.modelNumber) {
      formData.append('modelNumber', this.cameraForm.value.modelNumber.trim());
    }

    // Specifications JSON
    const specs = {
      resolution: this.cameraForm.value.resolution,
      sensor: this.cameraForm.value.sensor,
      iso: this.cameraForm.value.iso,
      video: this.cameraForm.value.video
    };
    formData.append('specifications', JSON.stringify(specs));

    // Images logic
    this.existingImageUrls.forEach(url => formData.append('keepImages', url));
    this.newSelectedFiles.forEach(file => formData.append('images', file));

    this.cameraService.updateCamera(this.cameraId, formData).subscribe({
      next: () => {
        this.loader.stop();
        this.toastr.success('Item updated successfully');
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