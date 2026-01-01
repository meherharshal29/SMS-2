import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = 'http://localhost:5000/api/packages';

  constructor(private http: HttpClient) { }

  // Get all packages
  getAllPackages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  // Get packages by category (e.g., 'Photography')
  getPackagesByCategory(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/category/${category}`);
  }

  // Create a new package
  createPackage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data);
  }

  // Upload images to a package (Uses Form Data)
  uploadImages(packageId: number, images: File[]): Observable<any> {
    const formData = new FormData();
    images.forEach(file => formData.append('images', file));
    return this.http.post(`${this.apiUrl}/${packageId}/add-images`, formData);
  }

  getPackageById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}