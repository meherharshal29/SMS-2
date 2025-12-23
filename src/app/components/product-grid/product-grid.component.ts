import { Component, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

interface Product {
  id: number;
  category: string;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
}
@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss'
})
export class ProductGridComponent {
  trendingProducts = signal<Product[]>([
    { id: 1, category: 'CAMERAS', name: 'Sony Alpha a7 IV Body', price: 3500, oldPrice: 4000, discount: 12, image: 'assets/sony-a7iv.jpg' },
    { id: 2, category: 'LENSES', name: 'Sony FE 24-70mm f/2.8 GM', price: 1800, oldPrice: 2200, discount: 18, image: 'assets/lens-2470.jpg' },
    { id: 3, category: 'CINEMA', name: 'RED Komodo 6K Kit', price: 12000, oldPrice: 15000, discount: 20, image: 'assets/red-komodo.jpg' },
    { id: 4, category: 'GIMBALS', name: 'DJI RS 3 Pro Stabilizer', price: 1500, oldPrice: 2000, discount: 25, image: 'assets/dji-rs3.jpg' },
    { id: 5, category: 'DRONES', name: 'DJI Mavic 3 Cine Premium', price: 5500, oldPrice: 6500, discount: 15, image: 'assets/dji-mavic.jpg' },
    { id: 6, category: 'LIGHTING', name: 'Aputure LS 600d Pro', price: 2500, oldPrice: 3000, discount: 16, image: 'assets/aputure.jpg' }
  ]);
}