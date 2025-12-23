import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Course {
  id: number;
  title: string;
  category: 'Photography' | 'Editing' | 'Design' | 'Video';
  image: string;
  duration: string;
  lessons: number;
  price: number;
  rating: number;
}

@Component({
  selector: 'app-course-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-grid.component.html',
  styleUrl: './course-grid.component.scss'
})
export class CourseGridComponent {
  // Initial count is 4
  private readonly initialCount = 4;
  visibleCount = signal(this.initialCount);

  courses = signal<Course[]>([
    { id: 1, title: 'Professional Portrait Photography', category: 'Photography', duration: '12h', lessons: 24, price: 4999, rating: 4.8, image: 'https://picsum.photos/seed/c1/600/400' },
    { id: 2, title: 'Advanced Lightroom Retouching', category: 'Editing', duration: '8h', lessons: 15, price: 2499, rating: 4.9, image: 'https://picsum.photos/seed/c2/600/400' },
    { id: 3, title: 'Wedding Album Layout Design', category: 'Design', duration: '10h', lessons: 18, price: 3200, rating: 4.7, image: 'https://picsum.photos/seed/c3/600/400' },
    { id: 4, title: 'Cinematic Video Editing (Premiere)', category: 'Video', duration: '20h', lessons: 45, price: 5500, rating: 5.0, image: 'https://picsum.photos/seed/c4/600/400' },
    { id: 5, title: 'Landscape Photography Masterclass', category: 'Photography', duration: '15h', lessons: 30, price: 4500, rating: 4.8, image: 'https://picsum.photos/seed/c5/600/400' },
    { id: 6, title: 'Photoshop for Digital Artists', category: 'Editing', duration: '25h', lessons: 50, price: 6000, rating: 4.9, image: 'https://picsum.photos/seed/c6/600/400' },
    { id: 7, title: 'Color Grading for Filmmakers', category: 'Video', duration: '12h', lessons: 22, price: 3999, rating: 4.7, image: 'https://picsum.photos/seed/c7/600/400' },
    { id: 8, title: 'Minimalist Portfolio Design', category: 'Design', duration: '6h', lessons: 12, price: 1999, rating: 4.6, image: 'https://picsum.photos/seed/c8/600/400' },
    { id: 9, title: 'Action Sports Videography', category: 'Video', duration: '14h', lessons: 28, price: 4200, rating: 4.8, image: 'https://picsum.photos/seed/c9/600/400' },
    { id: 10, title: 'Commercial Product Photography', category: 'Photography', duration: '18h', lessons: 35, price: 5800, rating: 4.9, image: 'https://picsum.photos/seed/c10/600/400' },
    { id: 11, title: 'Mobile Video Editing (VN/CapCut)', category: 'Video', duration: '5h', lessons: 10, price: 999, rating: 4.5, image: 'https://picsum.photos/seed/c11/600/400' },
    { id: 12, title: 'Typography & Layout Essentials', category: 'Design', duration: '9h', lessons: 16, price: 2100, rating: 4.7, image: 'https://picsum.photos/seed/c12/600/400' }
  ]);

  displayCourses = computed(() => this.courses().slice(0, this.visibleCount()));
  hasMore = computed(() => this.visibleCount() < this.courses().length);
  canShowLess = computed(() => this.visibleCount() > this.initialCount);

  loadMore() {
    this.visibleCount.update(val => Math.min(val + 4, this.courses().length));
  }

  showLess() {
    this.visibleCount.update(val => Math.min(val - 4, this.courses().length));
  }
}