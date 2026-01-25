import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MessageService } from '../../services/message/message.service';
import { AuthService } from '../../auth/services/auth.service'; // Added
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-request-call-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './request-call-modal.component.html',
  styleUrl: './request-call-modal.component.scss'
})
export class RequestCallModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<RequestCallModalComponent>);
  private messageService = inject(MessageService);
  private auth = inject(AuthService); // Added
  private toast = inject(ToastrService);

  showForm = false;
  selectedCategory = '';

  ngOnInit(): void {
    // Safety check: if modal opens but user isn't logged in
    if (!this.auth.isLoggedIn()) {
      this.toast.error('Authentication required. Please log in.', 'Logged Out');
      this.close();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  submitRequest(): void {
    if (!this.selectedCategory) {
      this.toast.warning('Please select a category first.');
      return;
    }

    const payload = { subject: this.selectedCategory };

    // Showing a "Processing" message can improve UX
    this.messageService.requestCallback(payload).subscribe({
      next: (res: any) => {
        // "res.message" usually contains "Request received"
        this.toast.success(res.message || 'Callback requested successfully!');
        this.close();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Unable to process request at this time.';
        this.toast.error(errorMsg);
        this.close();
      }
    });
  }
}