import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface GalleryItem {
  id: number;
  url: string;
  thumbnailUrl?: string;
  mediaType: 'photo' | 'video' | 'reel';
  title: string;
  category: string;
}

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule, MatTabsModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatSnackBarModule, MatTableModule, MatCheckboxModule, MatTooltipModule
  ],
  templateUrl: './admin-gallery.component.html',
  styleUrl: './admin-gallery.component.scss'
})
export class AdminGalleryComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private readonly API_BASE = 'http://localhost:5000/api/gallery';

  // --- Common State ---
  loading = false;
  dataSource = new MatTableDataSource<GalleryItem>([]);
  selection = new SelectionModel<GalleryItem>(true, []);
  displayedColumns = ['select', 'preview', 'type', 'title', 'category', 'actions'];

  // --- Photo Upload State ---
  photoFiles: File[] = [];
  photoPreviews: string[] = [];
  photoTitles: string[] = ['', '', '', ''];
  photoCats: string[] = ['Fashion', 'Fashion', 'Fashion', 'Fashion'];

  // --- Video Upload State ---
  videoFiles: File[] = [];
  videoTitles: string[] = ['', ''];
  videoCats: string[] = ['Cinematography', 'Cinematography'];
  isReel: string[] = ['false', 'false'];

  ngOnInit() { this.loadGallery(); }

  loadGallery() {
    this.http.get<any>(this.API_BASE).subscribe({
      next: (res) => this.dataSource.data = res.data || res,
      error: () => this.showNotif('Error loading gallery items', 'error')
    });
  }

  // --- Photo Handling ---
  onPhotoSelect(event: any) {
    const files = event.target.files;
    if (files) {
      // FIX: Explicitly cast as File[] to solve TS2322
      this.photoFiles = (Array.from(files) as File[]).slice(0, 4);
      this.photoPreviews = [];

      this.photoFiles.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = (e: any) => this.photoPreviews[i] = e.target.result;
        reader.readAsDataURL(file);
      });
    }
  }

  submitPhotos() {
    if (this.photoFiles.length === 0) return;
    this.loading = true;
    const fd = new FormData();

    this.photoFiles.forEach(f => fd.append('photos', f));
    this.photoFiles.forEach((_, i) => {
      fd.append('titles', this.photoTitles[i] || 'Untitled Photo');
      fd.append('categories', this.photoCats[i] || 'General');
    });

    this.http.post(`${this.API_BASE}/upload-photos`, fd).subscribe({
      next: () => {
        this.showNotif('Photos Uploaded Successfully!');
        this.resetPhotos();
        this.loadGallery();
      },
      error: () => {
        this.showNotif('Photo Upload Failed', 'error');
        this.loading = false;
      }
    });
  }

  // --- Video Handling ---
  onVideoSelect(event: any) {
    const files = event.target.files;
    if (files) {
      // FIX: Explicitly cast as File[] to solve TS2322
      this.videoFiles = (Array.from(files) as File[]).slice(0, 2);
    }
  }

  submitVideos() {
    if (this.videoFiles.length === 0) return;
    this.loading = true;
    const fd = new FormData();

    this.videoFiles.forEach(f => fd.append('videos', f));
    this.videoFiles.forEach((_, i) => {
      fd.append('titles', this.videoTitles[i] || 'Untitled Video');
      fd.append('categories', this.videoCats[i] || 'Cinematography');
      fd.append('isReel', this.isReel[i]);
    });

    this.http.post(`${this.API_BASE}/upload-videos`, fd).subscribe({
      next: () => {
        this.showNotif('Videos/Reels Uploaded!');
        this.resetVideos();
        this.loadGallery();
      },
      error: () => {
        this.showNotif('Video Upload Failed', 'error');
        this.loading = false;
      }
    });
  }

  // --- Management Logic ---
  deleteSingle(id: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.http.delete(`${this.API_BASE}/${id}`).subscribe({
        next: () => {
          this.showNotif('Item deleted');
          this.loadGallery();
        }
      });
    }
  }

  deleteBulk() {
    const ids = this.selection.selected.map(s => s.id);
    if (confirm(`Delete ${ids.length} items permanently?`)) {
      this.http.post(`${this.API_BASE}/bulk-delete`, { ids }).subscribe({
        next: () => {
          this.showNotif(`${ids.length} items removed`);
          this.selection.clear();
          this.loadGallery();
        }
      });
    }
  }

  // --- Helpers ---
  private resetPhotos() {
    this.photoFiles = [];
    this.photoPreviews = [];
    this.photoTitles = ['', '', '', ''];
    this.loading = false;
  }

  private resetVideos() {
    this.videoFiles = [];
    this.videoTitles = ['', ''];
    this.loading = false;
  }

  private showNotif(m: string, t: 'success' | 'error' = 'success') {
    this.snackBar.open(m, 'Close', {
      duration: 3000,
      panelClass: t === 'success' ? ['bg-success', 'text-white'] : ['bg-danger', 'text-white']
    });
  }

  toggleAll() {
    this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.dataSource.data);
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }
}