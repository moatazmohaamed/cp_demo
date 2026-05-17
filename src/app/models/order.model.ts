import { SubService } from './sub-service.model';
import { OrderStatusHistory } from './order-status-history.model';
import { FinancialBreakdown } from './financial-breakdown.model';
import { ShippingDetails } from './shipping-details.model';
import { CustomerProfile } from './customer-profile.model';

export interface CsTask {
  id: string;
  status: 'Assigned' | 'Revised' | 'Undo';
  assignedDoctor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  // ========== CORE ORDER FIELDS ==========
  id: number;
  scanCenter: string;
  doctor: string;
  patientName: string;
  patientNumbering: string;
  isVip: boolean;
  isLocked: boolean;
  notes: string;
  archiveDate: string;
  orderType: string;
  orderLabel: string;

  // ========== PATIENT/CLINICAL DATA ==========
  maxillary: string | null;
  mandibular: string | null;
  format: string | null;

  // ========== EXPANDED ORDER STATUS TRACKING ==========
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: OrderStatusHistory[];
  currentStatusReason: string;
  statusChangeNotes: string;
  statusLastChangedAt: string;
  estimatedCompletionDate: string;
  actualCompletionDate: string;

  // ========== LEGACY FIELDS (kept for compatibility) ==========
  billTo: string;
  billToAccount: string;
  amountBilled: number;
  vouchers: string;
  receivedTime: string;
  sentTime: string;
  updateTime: string;
  updateStatus: string;
  chargedOn: string;
  action: string;
  changeRequest: string;
  csTask: CsTask | null;

  // ========== FINANCIAL COMPLEXITY ==========
  financials: FinancialBreakdown;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'invoice' | 'check';
  invoiceId: string;
  invoiceGeneratedAt: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  refundDetails: {
    refundAmount: number;
    refundReason: string;
    refundInitiatedAt: string;
    refundProcessedAt: string;
    refundStatus: 'pending' | 'processed' | 'failed';
  } | null;

  // ========== CUSTOMER & SHIPPING INTELLIGENCE ==========
  shipping: ShippingDetails;
  customerProfile: CustomerProfile;
  shippingTier: 'standard' | 'express' | 'overnight' | 'pick_up';
  carrier: string;
  trackingNumber: string;
  deliveryTimeEstimate: string;
  actualDeliveryDate: string;
  deliverySignature: boolean;
  multipleShippingAddresses: Array<{
    id: string;
    type: 'billing' | 'shipping' | 'alternate';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  shippingAddressValidationStatus: 'valid' | 'invalid' | 'pending' | 'corrected';
  shippingAddressNotes: string;

  // ========== ANALYTICS-READY FIELDS ==========
  analytics: {
    customerLifetimeValue: number;
    orderFrequency: number; // orders in last 12 months
    productAffinityScores: Record<string, number>; // productType -> score
    deliverySatisfactionScore: number; // 1-5
    qualitySatisfactionScore: number; // 1-5
    isRepeatingCustomer: boolean;
    customerSince: string;
    averageOrderValue: number;
  };

  subServices: SubService[];
}
