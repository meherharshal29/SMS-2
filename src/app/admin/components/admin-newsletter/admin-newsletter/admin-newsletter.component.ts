import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxUiLoaderService, NgxUiLoaderModule } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { NewsletterService } from '../../../services/newsletter/newsletter.service';
import { MaterialModule } from '../../../../shared/material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-newsletter',
  templateUrl: './admin-newsletter.component.html',
  styleUrls: ['./admin-newsletter.component.scss'],
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule, NgxUiLoaderModule]
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
    if (this.newsletterForm.invalid || Object.keys(this.selectedImages).length < 3) {
      this.toastr.warning("Please provide all text fields and 3 images.", "Incomplete Form");
      return;
    }

    this.loader.start(); // Start ngx-ui-loader
    this.loading = true;

    const fd = new FormData();
    Object.keys(this.newsletterForm.value).forEach(key => {
      if (this.newsletterForm.value[key]) fd.append(key, this.newsletterForm.value[key]);
    });

    fd.append('image1', this.selectedImages[1]);
    fd.append('image2', this.selectedImages[2]);
    fd.append('image3', this.selectedImages[3]);

    const request = type === 'all'
      ? this.newsletterService.sendToAll(fd)
      : this.newsletterService.sendToSingle(fd);

    request.subscribe({
      next: () => {
        this.loader.stop();
        this.loading = false;
        this.toastr.success(type === 'all' ? "Blast Successful!" : "Test Email Sent!");
        if (type === 'all') this.reset();
      },
      error: (err) => {
        this.loader.stop();
        this.loading = false;
        this.toastr.error(err.message || "Failed to send");
      }
    });
  }

  private reset() {
    this.newsletterForm.reset();
    this.imagePreviews = {};
    this.selectedImages = {};
  }
}