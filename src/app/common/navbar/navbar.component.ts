import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, signal, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isMobileOpen = signal(false);
  activeHover = signal<string | null>(null);

  // Track if the user has scrolled down
  isScrolled = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      // Threshold of 50px to trigger background change
      const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.isScrolled.set(scrollOffset > 50);
    }
  }

  toggleMobile() {
    this.isMobileOpen.update(v => !v);
  }

  navData = [
    {
      label: 'Rentals',
      columns: [
        { title: 'Cameras', items: ['Sony A7IV', 'Canon R6', 'Red Komodo'] },
        { title: 'Equipment', items: ['Lenses', 'Gimbals', 'Audio Kit'] }
      ],
      featured: { title: 'New Arrivals', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400' }
    },
    {
      label: 'Services',
      columns: [
        { title: 'Events', items: ['Wedding Shoot', 'Photoshoot', 'Drone Coverage'] },
        { title: 'Editing', items: ['Video Editing', 'Wedding Album', 'Color Grading'] }
      ],
      featured: { title: 'Book Now', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400' }
    }
  ];
}