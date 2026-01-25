import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces ---

/**
 * Camera technical specifications.
 * All properties are optional as per backend requirements.
 */
export interface CameraSpecifications {
  resolution?: string;
  sensorType?: string;
  isoRange?: string;
  videoResolution?: string;
  lensMount?: string;
  dynamicRange?: string;
  weight?: string;
  dimensions?: string;
  [key: string]: string | undefined;
}

export interface CameraImage {
  id?: number;
  url: string;
  isPrimary?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Camera {
  id: number;
  name: string;
  brand: string;
  modelNumber?: string;
  description: string;
  pricePerDay: number;
  status?: 'active' | 'maintenance' | 'retired';
  specifications?: CameraSpecifications;
  images?: CameraImage[];
  categoryId: number;
  category?: Category; // Populated by backend join
  avgRating?: number;
  totalReviews?: number;
  displayImage?: string; // Client-side helper property
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cameras`;
  private readonly categoryUrl = `${environment.apiUrl}/categories`;
  private readonly backendUrl = 'http://localhost:5000'; // Target for static assets

  /**
   * Helper: Generate Admin Auth Headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Helper: Normalize Camera Data
   * Handles path normalization, display image assignment, and specification parsing.
   */
  private transformCameraData(camera: Camera): Camera {
    // 1. Fix Image URLs and set display helper
    if (camera.images && Array.isArray(camera.images) && camera.images.length > 0) {
      camera.images.forEach(img => {
        img.url = this.getPrivateImageUrl(img.url);
      });

      const primary = camera.images.find(i => i.isPrimary);
      camera.displayImage = primary ? primary.url : camera.images[0].url;
    } else {
      camera.displayImage = this.getPrivateImageUrl(''); // Fallback placeholder
    }

    // 2. Safely parse JSON specifications if they arrive as strings
    if (typeof camera.specifications === 'string') {
      try {
        camera.specifications = JSON.parse(camera.specifications);
      } catch (e) {
        camera.specifications = {};
      }
    }
    return camera;
  }

  // ==========================================
  // 1. CATEGORY METHODS
  // ==========================================

  /**
   * Retrieves all categories for filtering
   */
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(this.categoryUrl);
  }

  // ==========================================
  // 2. CAMERA CRUD METHODS
  // ==========================================

  /**
   * Fetches all cameras with optional filtering
   * @param filters - Object containing categoryId, brand, etc.
   */
  getAllCameras(filters: any = {}): Observable<ApiResponse<Camera[]>> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Camera[]>>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          response.data = response.data.map(camera => this.transformCameraData(camera));
        }
        return response;
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Fetch a single item by ID
   */
  getCameraById(id: string | number): Observable<ApiResponse<Camera>> {
    return this.http.get<ApiResponse<Camera>>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        if (res.success && res.data) {
          res.data = this.transformCameraData(res.data);
        }
        return res;
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Admin: Add new equipment
   */
  addCamera(formData: FormData): Observable<ApiResponse<Camera>> {
    return this.http.post<ApiResponse<Camera>>(
      `${this.apiUrl}/add`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Admin: Full update of equipment
   */
  updateCamera(id: string | number, formData: FormData): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/update-full/${id}`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Admin: Remove equipment and clean up disk/DB
   */
  deleteCamera(id: string | number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/delete/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ==========================================
  // 3. UTILITY METHODS
  // ==========================================

  /**
   * Normalizes image paths for the browser
   * Converts "uploads\img.jpg" to "http://localhost:5000/uploads/img.jpg"
   */
  getPrivateImageUrl(relativePath: string | undefined): string {
    if (!relativePath) return 'https://placehold.co/600x600?text=No+Image';

    if (relativePath.startsWith('http')) return relativePath;

    const cleanPath = relativePath.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;

    return `${this.backendUrl}/${finalPath}`;
  }
}