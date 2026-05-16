export interface OrderStatusHistory {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: string;
  changedBy: string;
  reason: string;
  reasonCode: string; // e.g., "PAYMENT_RECEIVED", "QUALITY_CHECK_FAILED", "CUSTOMER_REQUEST"
  notes: string;
  attachments?: string[]; // URLs or file references
}
