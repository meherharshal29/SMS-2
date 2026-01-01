import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';

interface ProductCollection {
  title: string;
  image: string;
  link: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxUiLoaderModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {

  collections = signal<ProductCollection[]>([
    {
      title: 'Camera Rentals',
      link: '/rental-all-item',
      image: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=687&auto=format&fit=crop'
    },
    {
      title: 'Wedding Packages',
      link: '/packages/wedding',
      image: 'https://images.unsplash.com/photo-1743684821666-05b9c5046937?q=80&w=1171&auto=format&fit=crop'
    },
    {
      title: 'Photography Academy',
      link: '/courses',
      image: 'https://images.unsplash.com/photo-1724839338419-435d1fdfb047?q=80&w=1170&auto=format&fit=crop'
    },
    {
      title: 'Studio Lighting',
      link: '/rentals/lighting',
      image: 'https://images.unsplash.com/photo-1598006839649-5588feb1bae0?q=80&w=1925&auto=format&fit=crop'
    }
  ]);

  constructor(private loader: NgxUiLoaderService) { }
}