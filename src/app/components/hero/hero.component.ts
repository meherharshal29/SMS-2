import { Component, OnInit, AfterViewInit, HostListener, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { RouterModule } from '@angular/router';

interface ImageItem {
  url: string;
  alt: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // Original Image Data
  imageUrls: ImageItem[] = [
    { url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=687&auto=format&fit=crop', alt: 'Model 1' },
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop', alt: 'Model 2' },
    { url: 'https://images.unsplash.com/photo-1562572159-4efc207f5aff?q=80&w=735&auto=format&fit=crop', alt: 'Model 3' },
    { url: 'https://plus.unsplash.com/premium_photo-1673757121102-0ca51260861f?q=80&w=687&auto=format&fit=crop', alt: 'Model 4' },
    { url: 'https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?q=80&w=687&auto=format&fit=crop', alt: 'Model 5' },
    { url: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=687&auto=format&fit=crop', alt: 'Model 6' },
  ];

  columnOneImages = signal<ImageItem[]>([]);
  columnTwoImages = signal<ImageItem[]>([]);
  private minDesktopWidth = 900;

  ngOnInit(): void {
    const half = Math.ceil(this.imageUrls.length / 2);
    const col1 = this.imageUrls.slice(0, half);
    const col2 = this.imageUrls.slice(half);

    // Duplicate arrays to allow seamless resetting of the scroll
    this.columnOneImages.set([...col1, ...col1]);
    this.columnTwoImages.set([...col2, ...col2]);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Small delay to ensure browser layout calculation
      setTimeout(() => this.initHeroAnimation(), 200);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      gsap.killTweensOf('.image-column');
      this.initHeroAnimation();
    }
  }

  private initHeroAnimation(): void {
    const col1 = document.querySelector('.column-one') as HTMLElement;
    const col2 = document.querySelector('.column-two') as HTMLElement;

    if (!col1 || !col2) return;

    // Reset properties before recalculating
    gsap.set([col1, col2], { clearProps: 'all' });

    if (window.innerWidth >= this.minDesktopWidth) {
      // DESKTOP: Vertical Opposite Scrolling
      this.animate(col1, { yPercent: -50 }, { yPercent: 0 }, 5);
      this.animate(col2, { yPercent: 0 }, { yPercent: -50 }, 5);
    } else {
      // MOBILE: Horizontal Single Track Scrolling
      this.animate(col1, { x: 0 }, { x: -col1.scrollWidth / 2 }, 15);
      this.animate(col2, { x: 0 }, { x: -col2.scrollWidth / 2 }, 15);
    }
  }

  private animate(target: HTMLElement, from: object, to: object, duration: number) {
    gsap.fromTo(target, from, {
      ...to,
      ease: 'none',
      duration: duration,
      repeat: -1,
    });
  }

  scrollToStudio() {
    const element = document.querySelector('.studio-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}