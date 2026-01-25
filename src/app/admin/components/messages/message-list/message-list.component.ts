// src/app/admin/messages/message-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message, MessageService } from '../../../services/message/message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
  imports: [CommonModule]
})
export class MessageListComponent implements OnInit {
  messages: Message[] = [];
  loading = false;
  error: string | null = null;

  constructor(private messageService: MessageService, private router: Router) { }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.error = null;
    this.messages = [];

    this.messageService.getAllMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.message || 'Failed to load messages';
        this.loading = false;
        this.messages = [];
      }
    });
  }

  viewMessage(id: number): void {
    this.router.navigate(['/admin/messages', id]);
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'unread': return 'badge bg-danger';
      case 'read': return 'badge bg-warning text-dark';
      case 'replied': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }
}