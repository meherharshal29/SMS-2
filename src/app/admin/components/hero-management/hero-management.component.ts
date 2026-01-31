import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroService } from '../../services/hero/hero.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero-management',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressBarModule, MatIconModule],
  templateUrl: './hero-management.component.html'
})
export class HeroManagementComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFiles: File[] = [];
  isUploading = signal(false);
  uploadMessage = signal('');
  isError = signal(false);

  constructor(private heroService: HeroService) { }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length > 10) {
      this.isError.set(true);
      this.uploadMessage.set('Error: Maximum 10 images allowed at once.');
      return;
    }
    this.selectedFiles = files;
    this.isError.set(false);
    this.uploadMessage.set(files.length > 0 ? `${files.length} files selected.` : '');
  }

  uploadImages(column: string) {
    if (this.selectedFiles.length === 0) return;

    this.isUploading.set(true);
    this.isError.set(false);
    this.uploadMessage.set('Uploading to Cloudinary...');

    this.heroService.uploadHeroImages(this.selectedFiles, column).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.uploadMessage.set('Success! Hero images updated.');
        this.selectedFiles = [];
        this.fileInput.nativeElement.value = '';
      },
      error: (err) => {
        this.isUploading.set(false);
        this.isError.set(true);
        this.uploadMessage.set(err.message);
      }
    });
  }
}