import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment/payment.service';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-status.component.html',
  styleUrl: './payment-status.component.scss'
})
export class PaymentStatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);
  private cartService = inject(CartService);

  // Status state using signals
  status = signal<'loading' | 'success' | 'failed'>('loading');
  transactionId = signal<string | null>(null);

  ngOnInit() {
    // 1. Get transaction ID from URL params (/status/:txnId)
    const txnId = this.route.snapshot.paramMap.get('txnId');
    this.transactionId.set(txnId);

    if (txnId) {
      this.verifyPayment(txnId);
    } else {
      this.status.set('failed');
    }
  }

  verifyPayment(txnId: string) {
    this.paymentService.verifyStatus(txnId).subscribe({
      next: (res: any) => {
        // PhonePe returns 'PAYMENT_SUCCESS' in the code field
        if (res.code === 'PAYMENT_SUCCESS') {
          this.status.set('success');
        } else {
          this.status.set('failed');
        }
      },
      error: (err) => {
        console.error('Status check failed:', err);
        this.status.set('failed');
      }
    });
  }
}