import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { OrderStatusHistory } from '../../models/order-status-history.model';

@Component({
  selector: 'app-status-history-modal',
  standalone: true,
  imports: [CommonModule, TuiIcon],
  templateUrl: './status-history-modal.component.html',
  styleUrl: './status-history-modal.component.scss'
})
export class StatusHistoryModalComponent {
  isOpen = input<boolean>(false);
  statusHistory = input<OrderStatusHistory[]>([]);
  orderId = input<number>(0);
  currentStatus = input<string>('');
  close = output<void>();

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': '#FFA500',
      'confirmed': '#4CAF50',
      'processing': '#2196F3',
      'completed': '#8BC34A',
      'shipped': '#00BCD4',
      'delivered': '#27AE60',
      'cancelled': '#F44336'
    };
    return colors[status] || '#9E9E9E';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': '@tui.clock',
      'confirmed': '@tui.check-circle',
      'processing': '@tui.activity',
      'completed': '@tui.check-circle-2',
      'shipped': '@tui.package',
      'delivered': '@tui.check',
      'cancelled': '@tui.x-circle'
    };
    return icons[status] || '@tui.circle';
  }

  getReasonCodeLabel(reasonCode: string): string {
    const labels: Record<string, string> = {
      'ORDER_RECEIVED': 'Order Received',
      'PAYMENT_RECEIVED': 'Payment Received',
      'PROCESSING_STARTED': 'Processing Started',
      'QUALITY_CHECK_PASSED': 'Quality Check Passed',
      'QUALITY_CHECK_FAILED': 'Quality Check Failed',
      'SHIPPED': 'Order Shipped',
      'DELIVERED': 'Delivered',
      'PAYMENT_PENDING': 'Payment Pending',
      'CUSTOMER_REQUEST': 'Customer Request',
      'SYSTEM_ISSUE': 'System Issue',
      'DELIVERY_FAILED': 'Delivery Failed',
      'RETURNED': 'Returned to Sender'
    };
    return labels[reasonCode] || reasonCode;
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
