import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
interface RentalItem {
  id: number;
  brand: string;
  model_name: string;
  price_per_day: number;
  original_price?: number;
  discount?: number;
  images: string[];
  all_images?: string;
}

@Injectable({ providedIn: 'root' })
export class CameraService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api';

  getAllCameras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all-cameras`);
  }

  // FIXED: Maps image objects to a clean string array
  getCameraById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/camera/${id}`).pipe(
      map(camera => ({
        ...camera,
        images: camera.images ? camera.images.map((img: any) => img.image_url) : []
      }))
    );
  }
}