import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GalleryItem {
  id: number;
  url: string;
  thumbnailUrl?: string;
  mediaType: 'photo' | 'video' | 'reel';
  title: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/gallery`;

  /**
   * Fetch all items from the database
   */
  getGallery(): Observable<GalleryItem[]> {
    return this.http.get<{ success: boolean; data: GalleryItem[] }>(this.API_URL).pipe(
      map(res => res.success ? res.data : [])
    );
  }

  /**
   * Upload Photos (Key: photos)
   * Max 4 images allowed by backend
   */
  uploadPhotos(files: File[], titles: string[], categories: string[]): Observable<any> {
    const formData = new FormData();

    files.forEach(file => formData.append('photos', file));
    titles.forEach(title => formData.append('titles', title));
    categories.forEach(cat => formData.append('categories', cat));

    return this.http.post(`${this.API_URL}/upload-photos`, formData);
  }

  /**
   * Upload Videos or Reels (Key: videos)
   * @param isReelArray Array of strings ('true' or 'false')
   */
  uploadVideos(files: File[], titles: string[], categories: string[], isReelArray: string[]): Observable<any> {
    const formData = new FormData();

    files.forEach(file => formData.append('videos', file));
    titles.forEach(title => formData.append('titles', title));
    categories.forEach(cat => formData.append('categories', cat));
    isReelArray.forEach(val => formData.append('isReel', val));

    return this.http.post(`${this.API_URL}/upload-videos`, formData);
  }

  /**
   * Delete single item
   */
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  /**
   * Bulk Delete items
   */
  deleteMultiple(ids: number[]): Observable<any> {
    return this.http.post(`${this.API_URL}/bulk-delete`, { ids });
  }
}