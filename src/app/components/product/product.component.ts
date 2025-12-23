import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProductCollection {
  title: string;
  count: number;
  image: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  // Signal containing Photography-focused categories
  collections = signal<ProductCollection[]>([
    {
      title: 'Camera Rentals',
      count: 15,
      image: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Wedding Packages',
      count: 8,
      image: 'https://images.unsplash.com/photo-1743684821666-05b9c5046937?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Editing Academy',
      count: 5,
      image: 'https://images.unsplash.com/photo-1724839338419-435d1fdfb047?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Studio Lighting',
      count: 12,
      image: 'https://images.unsplash.com/photo-1598006839649-5588feb1bae0?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ]);
}