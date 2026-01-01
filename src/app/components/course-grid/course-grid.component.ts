import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course, CourseService } from '../../services/course/course.service';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../../common/footer/footer.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-course-grid',
  standalone: true,
  // Removed NgxUiLoaderModule from imports
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './course-grid.component.html',
  styleUrl: './course-grid.component.scss'
})
export class CourseGridComponent implements OnInit {
  private courseService = inject(CourseService);
  private toastr = inject(ToastrService);

  courses = signal<Course[]>([]);
  displayCourses = computed(() => this.courses());

  ngOnInit() {
    this.loadCoursesFromApi();
  }

  loadCoursesFromApi() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses.set(data);

        this.toastr.success('Academy courses loaded successfully!', 'Welcome', {
          toastClass: 'ngx-toastr custom-toast'
        });
      },
      error: (err) => {
        this.toastr.error('Failed to load courses. Please try again.', 'Error');
        console.error('Error fetching courses:', err);
      }
    });
  }

  // ngOnDestroy was removed as it was only being used for loader cleanup
}