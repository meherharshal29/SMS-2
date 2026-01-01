import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  rentPerDay: number;
  specifications: any;
  images: Array<{ imageUrl: string }>; // Array of image objects from backend
}

@Injectable({ providedIn: 'root' })
export class RentalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/products';

  getRentals(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}