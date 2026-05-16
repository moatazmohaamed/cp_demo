import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { FinancialBreakdown } from '../../models/financial-breakdown.model';

@Component({
  selector: 'app-financial-summary',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TuiIcon],
  templateUrl: './financial-summary.component.html',
  styleUrl: './financial-summary.component.scss'
})
export class FinancialSummaryComponent {
  financials = input<FinancialBreakdown | null>(null);
  paymentStatus = input<string>('pending');
  orderId = input<number>(0);
  openModal = output<void>();

  getPaymentStatusIcon(): string {
    const status = this.paymentStatus();
    switch (status) {
      case 'paid':
        return '@tui.check-circle';
      case 'partial':
        return '@tui.minus-circle';
      case 'pending':
        return '@tui.clock';
      case 'overdue':
        return '@tui.alert-circle';
      case 'refunded':
        return '@tui.rotate-ccw';
      default:
        return '@tui.help-circle';
    }
  }

  getPaymentStatusColor(): string {
    const status = this.paymentStatus();
    switch (status) {
      case 'paid':
        return '#27AE60';
      case 'partial':
        return '#F39C12';
      case 'pending':
        return '#3498DB';
      case 'overdue':
        return '#E74C3C';
      case 'refunded':
        return '#95A5A6';
      default:
        return '#95A5A6';
    }
  }

  getPaymentStatusLabel(): string {
    const status = this.paymentStatus();
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getPaymentPercentage(): number {
    const fin = this.financials();
    if (!fin || fin.totalAmount === 0) return 0;
    
    if (this.paymentStatus() === 'refunded') return 0;
    if (this.paymentStatus() === 'paid') return 100;
    
    const paid = fin.totalAmount - fin.outstandingBalance;
    return Math.round((paid / fin.totalAmount) * 100);
  }

  getDiscountDisplay(): string {
    const fin = this.financials();
    if (!fin) return '—';
    
    if (fin.discountCode) {
      return `${fin.discountPercentage}% (${fin.discountCode})`;
    }
    return `${fin.discountPercentage}%`;
  }

  onOpenModal(): void {
    this.openModal.emit();
  }
}
