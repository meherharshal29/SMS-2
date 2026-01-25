import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { NewsletterService } from '../../../services/newsletter/newsletter.service';
import { MaterialModule } from '../../../../shared/material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-newsletter',
  templateUrl: './admin-newsletter.component.html',
  styleUrls: ['./admin-newsletter.component.scss'],
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule]
})
export class AdminNewsletterComponent {
  private loader = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private newsletterService = inject(NewsletterService);
  private fb = inject(FormBuilder);

  newsletterForm: FormGroup;
  selectedImages: { [key: number]: File } = {};
  imagePreviews: { [key: number]: string } = {};
  loading = false;

  constructor() {
    this.newsletterForm = this.fb.group({
      subject: ['', Validators.required],
      title: ['', Validators.required],
      body: ['', [Validators.required, Validators.maxLength(250)]],
      link1: ['', Validators.required],
      link2: ['', Validators.required],
      link3: ['', Validators.required],
      targetEmail: ['']
    });
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImages[index] = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreviews[index] = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  sendNewsletter(type: 'all' | 'single') {
    // Basic validation check
    if (this.newsletterForm.invalid || Object.keys(this.selectedImages).length < 3) {
      this.toastr.warning("Please provide all text fields and 3 images.", "Incomplete Form");
      return;
    }

    // 1. Start Full Screen Loader immediately
    this.loader.start();
    this.loading = true;

    const fd = new FormData();
    // Append text data
    Object.keys(this.newsletterForm.value).forEach(key => {
      if (this.newsletterForm.value[key]) {
        fd.append(key, this.newsletterForm.value[key]);
      }
    });

    // Append the 3 mandatory images
    fd.append('image1', this.selectedImages[1]);
    fd.append('image2', this.selectedImages[2]);
    fd.append('image3', this.selectedImages[3]);

    const request = type === 'all'
      ? this.newsletterService.sendToAll(fd)
      : this.newsletterService.sendToSingle(fd);

    request.subscribe({
      next: (res) => {
        // 2. Stop Loader after backend completes sending
        this.loader.stop();
        this.loading = false;

        // 3. Display message properly
        const msg = type === 'all' ? "Newsletter Blasted to all Users!" : "Test Email Sent!";
        this.toastr.success(msg, "Campaign Success");

        if (type === 'all') this.reset();
      },
      error: (err) => {
        // Stop loader even on error to prevent screen lock
        this.loader.stop();
        this.loading = false;
        this.toastr.error(err.message || "Failed to send newsletter", "Server Error");
      }
    });
  }

  private reset() {
    this.newsletterForm.reset();
    this.imagePreviews = {};
    this.selectedImages = {};
  }
}