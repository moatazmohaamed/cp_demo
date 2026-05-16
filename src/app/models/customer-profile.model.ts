export interface CustomerProfile {
  customerId: string;
  customerType: 'individual' | 'clinic' | 'laboratory' | 'distributor';
  segmentationTags: Array<
    | 'VIP'
    | 'new'
    | 'returning'
    | 'wholesale'
    | 'subscription'
    | 'high_value'
    | 'at_risk'
    | 'corporate'
    | 'international'
  >;
  preferredContact: 'email' | 'phone' | 'sms' | 'whatsapp';
  communicationPreferences: {
    newsletter: boolean;
    promotional: boolean;
    orderUpdates: boolean;
    surveyRequests: boolean;
  };
  loyaltyProgramStatus: 'inactive' | 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsBalance: number;
  memberSince: string;
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  preferredPaymentMethod: string;
  creditLimit: number;
  availableCredit: number;
  riskProfile: 'low' | 'medium' | 'high';
  notes: string;
}
