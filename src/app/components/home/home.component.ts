import { Component, OnInit, inject, PLATFORM_ID, signal, computed, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

// Services
import { Course, CourseService } from '../../services/course/course.service';
import { PackageService } from '../../services/package/package.service'; // Ensure this exists

// Feature Components
import { HeroComponent } from "../hero/hero.component";
import { ProductComponent } from "../product/product.component";
import { PromoComponent } from "../promo/promo.component";
import { RentalComponent } from "../rental/rental.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { ReviewsComponent } from "../reviews/reviews.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroComponent,
    ProductComponent,
    PromoComponent,
    ReviewsComponent,
    FooterComponent,
    RentalComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private courseService = inject(CourseService);
  private packageService = inject(PackageService);

  // --- UI States ---
  showScroll = signal(false);

  // --- Course Grid Logic ---
  private readonly initialCourseCount = 4;
  visibleCourseCount = signal(this.initialCourseCount);
  allCourses = signal<Course[]>([]);
  displayCourses = computed(() => this.allCourses().slice(0, this.visibleCourseCount()));

  // --- Wedding Package Logic ---
  private readonly initialPackageCount = 4;
  visiblePackageCount = signal(this.initialPackageCount);
  allPackages = signal<any[]>([]);

  // Derived signals for Wedding UI
  displayPackages = computed(() => this.allPackages().slice(0, this.visiblePackageCount()));
  hasMorePackages = computed(() => this.visiblePackageCount() < this.allPackages().length);

  ngOnInit(): void {
    this.loadCourses();
    this.loadPackages();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => this.allCourses.set(data),
      error: (err) => console.error('Error fetching courses:', err)
    });
  }

  loadPackages() {
    this.packageService.getAllPackages().subscribe({
      next: (res) => this.allPackages.set(res.data),
      error: (err) => console.error('Error fetching packages:', err)
    });
  }

  loadMorePackages() {
    this.visiblePackageCount.update(count => count + 4);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.showScroll.set(window.scrollY > 500);
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}