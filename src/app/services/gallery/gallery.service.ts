import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GalleryItem {
  id: number;
  // Standardized to match your backend ENUMs
  mediaType: 'photo' | 'video' | 'reel';
  size: 'normal' | 'wide' | 'tall' | 'big';
  url: string;
  thumbnailUrl?: string; // Generated for videos
  title: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/gallery`;

  /**
   * Fetches all items and ensures standard format
   */
  getGalleryItems(): Observable<GalleryItem[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      })
    );
  }
}