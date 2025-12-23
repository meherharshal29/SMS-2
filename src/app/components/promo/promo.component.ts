import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PromoItem {
  title: string;
  subtitle: string;
  desc: string;
  saveAmount: string;
  image: string;
}

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promo.component.html',
  styleUrl: './promo.component.scss'
})
export class PromoComponent {
  promoList = signal<PromoItem[]>([
    {
      title: 'Sony Alpha Series',
      subtitle: 'Body & Lens Kit',
      desc: 'High-speed autofocus and incredible low-light performance for creators.',
      saveAmount: 'Save 4000/- Day',
      image: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Cinema Rig 4K',
      subtitle: 'Professional Video',
      desc: 'Industry-standard production kits for cinematic storytelling and ads.',
      saveAmount: 'Save 5000/- Day',
      image: 'https://images.unsplash.com/flagged/photo-1575290319880-014c6eba06b6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Lighting & Studio',
      subtitle: 'Flash & Constant',
      desc: 'Complete control over your light for portraits and commercial shoots.',
      saveAmount: 'Save 10,000/- Day',
      image: 'https://plus.unsplash.com/premium_photo-1675942080514-5cd95a2854e9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ]);
}