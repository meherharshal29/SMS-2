import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Course {
  id: number;
  title: string;
  category: string;
  image: string;
  duration: string;
  lessons: number;
  price: number;
  rating: number;
  description?: string;
  advantages?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/courses';

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/all`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/add`, course).pipe(
      catchError(this.handleError)
    );
  }

  updateCourse(id: number, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/update/${id}`, course).pipe(
      catchError(this.handleError)
    );
  }

  deleteCourse(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}