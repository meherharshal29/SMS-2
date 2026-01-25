import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services & Material Modules
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PackageService } from '../../../services/package/package.service';
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: 'app-add-package',
  standalone: true,
  templateUrl: './add-package.component.html',
  styleUrls: ['./add-package.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDivider
  ]
})
export class AddPackageComponent {
  packageForm: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isSubmitting = false;

  // Comprehensive list of 20+ photography categories
  categories = [
    'Wedding', 'Pre-Wedding', 'Engagement', 'Maternity', 'Newborn',
    'Kids & Baby', 'Birthday', 'Anniversary', 'House Warming',
    'Corporate Event', 'Conference', 'Product Photography',
    'Food & Beverage', 'Architecture/Interior', 'Real Estate',
    'Fashion/Model Shoot', 'Portfolio', 'Travel & Tourism',
    'Documentary', 'Sports', 'Candid Portrait', 'Family Portrait',
    'Graduation', 'Music/Concert', 'Fine Art', 'Other'
  ]
  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.packageForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      category: ['Wedding', Validators.required],
      description: ['', Validators.required],

      // Original Feature Booleans
      includesDrone: [false],
      includesCandid: [false],
      includesCinematicVideo: [false],
      includesTraditionalVideo: [true],

      // 👇 NEW Feature Booleans
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

  onFileSelected(event: any) {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        if (!file.type.match('image.*')) {
          this.snackBar.open('Only images are allowed!', 'Close', { duration: 2000 });
          continue;
        }
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit() {
    if (this.packageForm.invalid) {
      this.snackBar.open('Please fill all required fields.', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const val = this.packageForm.value;

    // A. Basic Fields
    formData.append('title', val.title);
    formData.append('price', val.price);
    formData.append('category', val.category);
    formData.append('description', val.description);

    // B. Booleans (Standard + New)
    formData.append('includesDrone', String(val.includesDrone));
    formData.append('includesCandid', String(val.includesCandid));
    formData.append('includesCinematicVideo', String(val.includesCinematicVideo));
    formData.append('includesTraditionalVideo', String(val.includesTraditionalVideo));
    // 👇 Append New options
    formData.append('includesPreWedding', String(val.includesPreWedding));
    formData.append('includesLiveStreaming', String(val.includesLiveStreaming));
    formData.append('includesCrane', String(val.includesCrane));
    formData.append('includesLedWall', String(val.includesLedWall));

    // C. Deliverables
    const delivArray = val.deliverablesInput.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
    formData.append('deliverables', JSON.stringify(delivArray));

    // D. Album Details
    const albumObj = { size: val.albumSize, sheets: val.albumSheets, type: val.albumType };
    formData.append('albumDetails', JSON.stringify(albumObj));

    // E. Images
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.packageService.createPackage(formData).subscribe({
      next: (res) => {
        this.snackBar.open('Package Created Successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('Upload Error:', err);
        this.snackBar.open(err.error?.message || 'Failed to create package.', 'Close', { duration: 4000 });
        this.isSubmitting = false;
      }
    });
  }
}