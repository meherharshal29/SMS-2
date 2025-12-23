import { Component, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Review {
  id: number;
  text: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent {
  currentIndex = signal(0);
  isMobile = signal(false);

  // Review Data Set
  reviews = signal<Review[]>([
    { id: 1, text: 'Suscipit tellus mauris a diam maecenas. Ut faucibus pulvinar elementum integer enim neque volutpat ac. Auctor urna nunc id cursus.', author: 'Salim Rana', role: 'Web Developer', avatar: 'https://i.pravatar.cc/150?u=1', rating: 5 },
    { id: 2, text: 'Pharetra vel turpis nunc eget. Suscipit tellus mauris a diam maecenas. Ut faucibus pulvinar elementum integer enim neque.', author: 'Selina Gomz', role: 'CO Founder', avatar: 'https://i.pravatar.cc/150?u=2', rating: 5 },
    { id: 3, text: 'Auctor urna nunc id cursus. Scelerisque purus semper eget duis at. Pharetra vel turpis nunc eget elementum integer enim.', author: 'Mark Zuker', role: 'UI Designer', avatar: 'https://i.pravatar.cc/150?u=3', rating: 5 },
    { id: 4, text: 'Integer enim neque volutpat ac. Auctor urna nunc id cursus. Scelerisque purus semper eget duis at pharetra vel turpis.', author: 'Sara Cone', role: 'Project Manager', avatar: 'https://i.pravatar.cc/150?u=4', rating: 5 },
    { id: 5, text: 'Maecenas ut faucibus pulvinar elementum integer enim neque volutpat ac. Auctor urna nunc id cursus scelerisque purus.', author: 'Alex Roe', role: 'Marketing', avatar: 'https://i.pravatar.cc/150?u=5', rating: 5 }
  ]);

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkScreenSize();
    }
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile.set(window.innerWidth < 992);
  }

  // Adaptive display: 1 on mobile, 2 on desktop
  visibleReviews = computed(() => {
    const all = this.reviews();
    const i = this.currentIndex();
    return this.isMobile()
      ? [all[i % all.length]]
      : [all[i % all.length], all[(i + 1) % all.length]];
  });

  next() {
    this.currentIndex.update(val => (val + 1) % this.reviews().length);
  }

  prev() {
    this.currentIndex.update(val => (val - 1 + this.reviews().length) % this.reviews().length);
  }

  setSlide(index: number) {
    this.currentIndex.set(index);
  }
}