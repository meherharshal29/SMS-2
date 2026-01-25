import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../../environments/environment";
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CameraImage {
  id?: number;
  url: string;
  isPrimary?: boolean;
}

export interface Camera {
  id: number;
  name: string;
  brand: string;
  modelNumber?: string;
  description: string;
  pricePerDay: number;
  specifications?: any;
  images?: CameraImage[];
  categoryId: number;
  category?: Category; // Joined from backend
}

export interface ApiResponse<T> {
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
  private readonly backendUrl = 'http://localhost:5000';

  /**
   * Helper: Generate Headers with Admin Token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Helper: Fix Image URLs and Normalize Paths
   */
  private fixCameraImages(camera: Camera): Camera {
    if (camera.images && Array.isArray(camera.images)) {
      camera.images.forEach(img => {
        if (img.url && !img.url.startsWith('http')) {
          const cleanPath = img.url.replace(/\\/g, '/');
          const finalPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
          img.url = `${this.backendUrl}/${finalPath}`;
        }
      });
    }
    return camera;
  }

  // ==========================================
  // 1. CATEGORY METHODS
  // ==========================================

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(this.categoryUrl);
  }

  // ==========================================
  // 2. CAMERA/EQUIPMENT CRUD METHODS
  // ==========================================

  getAllCameras(filters: any = {}): Observable<ApiResponse<Camera[]>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<ApiResponse<Camera[]>>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          response.data = response.data.map(camera => this.fixCameraImages(camera));
        }
        return response;
      })
    );
  }

  getCameraById(id: number): Observable<ApiResponse<Camera>> {
    return this.http.get<ApiResponse<Camera>>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        if (res.success && res.data) {
          res.data = this.fixCameraImages(res.data);
        }
        return res;
      })
    );
  }

  /**
   * ADD: Uses FormData for Multi-part (Text + up to 4 Images)
   */
  addCamera(formData: FormData): Observable<ApiResponse<Camera>> {
    return this.http.post<ApiResponse<Camera>>(
      `${this.apiUrl}/add`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * UPDATE FULL: Updates details and handles image replacement via keepImages
   */
  updateCamera(id: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/update-full/${id}`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * UPDATE GALLERY: Specialized method for adding/removing specific images
   */
  updateGallery(id: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/update-gallery/${id}`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * SET PRIMARY: Changes which image is the main display
   */
  setPrimaryImage(cameraId: number, imageId: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/set-primary/${cameraId}/${imageId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  deleteCamera(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/delete/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}