export interface FinancialBreakdown {
  basePrice: number;
  discountAmount: number;
  discountPercentage: number;
  discountCode: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  handlingFee: number;
  insuranceFee: number;
  totalAmount: number;
  currency: string; // 'USD', 'EUR', etc.
  exchangeRate: number; // for foreign transactions
  originalCurrency: string;
  originalAmount: number;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    taxable: boolean;
  }>;
  deposits?: Array<{
    depositAmount: number;
    depositDate: string;
    depositId: string;
  }>;
  outstandingBalance: number;
  daysOverdue: number;
}
