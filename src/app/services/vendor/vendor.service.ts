import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface EventPackage {
  id?: number;
  event_type: string;
  price: number;
  inclusions: string;
}

export interface GalleryImage {
  id?: number;
  image_url: string;
  cloudinary_id: string;
}

export interface Vendor {
  id?: number;
  business_name: string;
  location: string;
  base_price: number;
  experience: string;
  description: string;
  packages: EventPackage[];
  gallery: GalleryImage[];
}
@Injectable({ providedIn: 'root' })
export class VendorService {
  private apiUrl = 'http://localhost:5000/api/vendors';

  constructor(private http: HttpClient) { }

  getAllVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/all`);
  }

  getVendorById(id: number): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/profile/${id}`);
  }

  deleteVendor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile/${id}`);
  }
}