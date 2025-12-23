import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';

interface RentalItem {
  id: number;
  category: string;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
}

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './rental.component.html',
  styleUrl: './rental.component.scss'
})
export class RentalComponent {
  rentals = signal<RentalItem[]>([
    { id: 1, category: 'CAMERAS', name: 'Sony Alpha a7 IV Mirrorless', price: 3500, oldPrice: 4000, discount: 12, image: 'https://images.unsplash.com/photo-1563298258-c9b0371b55cc?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 2, category: 'LENSES', name: 'Sony FE 24-70mm f/2.8 GM II', price: 1800, oldPrice: 2200, discount: 18, image: 'https://images.unsplash.com/photo-1625571281451-eb482aa4dd44?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 3, category: 'CINEMA', name: 'RED Komodo 6K Cinema Kit', price: 12000, oldPrice: 15000, discount: 20, image: 'https://images.unsplash.com/photo-1635400138431-0bbde4d01484?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 4, category: 'STABILIZERS', name: 'DJI RS 3 Pro Gimbal', price: 1500, oldPrice: 2000, discount: 25, image: 'https://images.unsplash.com/photo-1536245802005-4ac4ba836e84?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 5, category: 'DRONES', name: 'DJI Mavic 3 Cine Premium', price: 5500, oldPrice: 6500, discount: 15, image: 'https://images.unsplash.com/photo-1588495077262-e41593eb23c8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 6, category: 'LIGHTING', name: 'Aputure LS 600d Pro LED', price: 2500, oldPrice: 3000, discount: 16, image: 'https://plus.unsplash.com/premium_photo-1675942079078-72b9fadd506c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 7, category: 'AUDIO', name: 'Sennheiser MKH 416 Mic', price: 1200, oldPrice: 1500, discount: 20, image: 'https://plus.unsplash.com/premium_photo-1664195074956-186ba8cd49d4?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 8, category: 'MONITORS', name: 'Atomos Ninja V+ 8K', price: 2000, oldPrice: 2500, discount: 20, image: 'https://images.unsplash.com/photo-1575387873801-3ffec9e2839d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
  ]);
}