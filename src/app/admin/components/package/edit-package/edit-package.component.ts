import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Material Imports
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PackageService } from '../../../services/package/package.service';

@Component({
  selector: 'app-edit-package',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatButtonModule,
    MatIconModule, MatCardModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './edit-package.component.html',
  styleUrls: ['./edit-package.component.scss']
})
export class EditPackageComponent implements OnInit {
  packageForm!: FormGroup;
  packageId!: string;
  existingImages: any[] = [];
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isLoading = true;
  isSubmitting = false;

  categories = [
    'Wedding', 'Pre-Wedding', 'Engagement', 'Maternity', 'Newborn',
    'Kids & Baby', 'Birthday', 'Anniversary', 'House Warming',
    'Corporate Event', 'Conference', 'Product Photography',
    'Food & Beverage', 'Architecture/Interior', 'Real Estate',
    'Fashion/Model Shoot', 'Portfolio', 'Travel & Tourism',
    'Documentary', 'Sports', 'Candid Portrait', 'Family Portrait',
    'Graduation', 'Music/Concert', 'Fine Art', 'Other'
  ].sort();

  private fb = inject(FormBuilder);
  private packageService = inject(PackageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.packageId = id;
      this.initForm();
      this.loadPackageData();
    } else {
      this.router.navigate(['/admin/manage-packages']);
    }
  }

  initForm() {
    this.packageForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      includesDrone: [false],
      includesCandid: [false],
      includesCinematicVideo: [false],
      includesTraditionalVideo: [false],
      includesPreWedding: [false],
      includesLiveStreaming: [false],
      includesCrane: [false],
      includesLedWall: [false],
      deliverablesInput: ['', Validators.required],
      albumSize: ['12x36'],
      albumSheets: [50],
      albumType: ['Karizma']
    });
  }

  loadPackageData() {
    this.packageService.getPackageById(this.packageId).subscribe({
      next: (res: any) => {
        const pkg = res.data || res;
        this.existingImages = pkg.images || [];

        let delivStr = '';
        if (pkg.deliverables) {
          if (Array.isArray(pkg.deliverables)) {
            delivStr = pkg.deliverables.join(', ');
          } else {
            try {
              const parsed = JSON.parse(pkg.deliverables);
              delivStr = Array.isArray(parsed) ? parsed.join(', ') : pkg.deliverables;
            } catch (e) {
              delivStr = pkg.deliverables;
            }
          }
        }

        let albumData = pkg.albumDetails;
        if (typeof albumData === 'string') {
          try { albumData = JSON.parse(albumData); } catch (e) { }
        }

        this.packageForm.patchValue({
          ...pkg,
          deliverablesInput: delivStr,
          albumSize: albumData?.size || '12x36',
          albumSheets: albumData?.sheets || 50,
          albumType: albumData?.type || 'Karizma'
        });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error loading package', 'Close');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        if (!file.type.match('image.*')) continue;
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  removeNewImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  deleteExistingImage(imageId: number) {
    if (confirm('Delete this image permanently from the gallery?')) {
      this.packageService.deletePackageImage(imageId).subscribe({
        next: () => {
          this.existingImages = this.existingImages.filter(img => img.id !== imageId);
          this.snackBar.open('Image deleted', 'Close', { duration: 2000 });
        },
        error: () => this.snackBar.open('Failed to delete image', 'Close')
      });
    }
  }

  onSubmit() {
    if (this.packageForm.invalid) return;
    this.isSubmitting = true;

    const formData = new FormData();
    const val = this.packageForm.value;

    formData.append('title', val.title);
    formData.append('price', val.price.toString());
    formData.append('category', val.category);
    formData.append('description', val.description);

    const booleans = [
      'includesDrone', 'includesCandid', 'includesCinematicVideo',
      'includesTraditionalVideo', 'includesPreWedding',
      'includesLiveStreaming', 'includesCrane', 'includesLedWall'
    ];
    booleans.forEach(key => formData.append(key, String(val[key])));

    const delivArray = val.deliverablesInput.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
    formData.append('deliverables', JSON.stringify(delivArray));
    formData.append('albumDetails', JSON.stringify({
      size: val.albumSize,
      sheets: val.albumSheets,
      type: val.albumType
    }));

    this.selectedFiles.forEach(file => formData.append('images', file));

    this.packageService.updatePackage(this.packageId, formData).subscribe({
      next: () => {
        this.snackBar.open('Package Updated Successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/manage-packages']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Update error:', err);
        this.snackBar.open(err.error?.message || 'Update failed', 'Close');
      }
    });
  }
}