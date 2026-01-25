import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-auth-prompt-modal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './auth-prompt-modal.component.html',
  styleUrl: './auth-prompt-modal.component.scss'
})
export class AuthPromptModalComponent {
  private dialogRef = inject(MatDialogRef<AuthPromptModalComponent>);

  /**
   * Closes the modal. Called when user clicks "X" or 
   * navigates away via the action buttons.
   */
  close(): void {
    this.dialogRef.close();
  }
}