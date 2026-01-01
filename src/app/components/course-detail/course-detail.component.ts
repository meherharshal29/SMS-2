import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Course, CourseService } from '../../services/course/course.service';
import { FooterComponent } from "../../common/footer/footer.component";

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, DecimalPipe],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  course = signal<Course | null>(null);
  relatedCourses = signal<Course[]>([]);
  loading = signal(true);

  ngOnInit() {
    // We subscribe to paramMap so the page refreshes if 
    // a user clicks a related course link
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        window.scrollTo(0, 0); // Scroll to top on navigation
        this.loadCourseData(+id);
      }
    });
  }

  loadCourseData(id: number) {
    this.loading.set(true);
    this.courseService.getCourseById(id).subscribe({
      next: (data) => {
        this.course.set(data);
        this.loadRelatedCourses(id);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  loadRelatedCourses(currentId: number) {
    this.courseService.getCourses().subscribe(allCourses => {
      // Filter out current course and take only 4 for suggestions
      const recommended = allCourses
        .filter(c => c.id !== currentId)
        .slice(0, 4);
      this.relatedCourses.set(recommended);
    });
  }
}