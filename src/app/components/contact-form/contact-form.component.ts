// src/app/contact/contact-form.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from '../../admin/services/message/message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ContactFormComponent {
  contactForm: FormGroup;
  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private messageService: MessageService) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  get f() { return this.contactForm.controls; }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.messageService.submitMessage(this.contactForm.value).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Message sent successfully!';
        this.contactForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to send message. Please try again.';
        this.loading = false;
      }
    });
  }
}