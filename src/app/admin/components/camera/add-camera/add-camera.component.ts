import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select'; // Import Select
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CameraService, Category } from '../../../services/camera/camera.service';

@Component({
  selector: 'app-add-camera',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSelectModule
  ],
  templateUrl: './add-camera.component.html',
  styleUrls: ['./add-camera.component.scss']
})
export class AddCameraComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cameraService = inject(CameraService);
  private toastr = inject(ToastrService);
  private loader = inject(NgxUiLoaderService);

  cameraForm!: FormGroup;
  categories: Category[] = []; // Store loaded categories
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isSubmitting = false;

  private readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.cameraService.getCategories().subscribe({
      next: (res) => this.categories = res.data,
      error: () => this.toastr.error('Failed to load categories')
    });
  }

  private initForm(): void {
    this.cameraForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', Validators.required],
      categoryId: [null, Validators.required], // New field
      modelNumber: [''],
      pricePerDay: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      resolution: ['',],
      sensor: ['',],
      iso: ['100-51200'],
      video: ['4K 30p']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > this.MAX_FILE_SIZE_BYTES) {
        this.toastr.error(`${file.name} is too large.`);
        return;
      }
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.imagePreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (this.cameraForm.invalid || this.selectedFiles.length === 0) {
      this.cameraForm.markAllAsTouched();
      this.toastr.warning('Please complete the form and add images.');
      return;
    }

    this.isSubmitting = true;
    this.loader.start();

    const formData = new FormData();
    // Basic fields
    formData.append('name', this.cameraForm.value.name);
    formData.append('brand', this.cameraForm.value.brand);
    formData.append('categoryId', this.cameraForm.value.categoryId);
    formData.append('pricePerDay', this.cameraForm.value.pricePerDay.toString());
    formData.append('description', this.cameraForm.value.description);
    if (this.cameraForm.value.modelNumber) {
      formData.append('modelNumber', this.cameraForm.value.modelNumber);
    }

    // Specifications Object -> String for Multer
    const specs = {
      resolution: this.cameraForm.value.resolution,
      sensor: this.cameraForm.value.sensor,
      iso: this.cameraForm.value.iso,
      video: this.cameraForm.value.video
    };
    formData.append('specifications', JSON.stringify(specs));

    // Images
    this.selectedFiles.forEach(file => formData.append('images', file));

    this.cameraService.addCamera(formData).subscribe({
      next: () => {
        this.loader.stop();
        this.toastr.success('Item added successfully!');
        this.resetFormCompletely();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.loader.stop();
        this.isSubmitting = false;
        this.toastr.error(err.error?.message || 'Upload failed');
      }
    });
  }

  private resetFormCompletely(): void {
    this.cameraForm.reset();
    this.initForm();
    this.selectedFiles = [];
    this.imagePreviews = [];
  }
}