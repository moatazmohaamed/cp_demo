export interface ShippingDetails {
  shippingMethod: 'standard' | 'express' | 'overnight' | 'pick_up' | 'international';
  carrier: string; // FedEx, UPS, DHL, etc.
  trackingNumber: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate: string;
  deliveryStatus: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
  };
  deliveryNotes: string;
  requiresSignature: boolean;
  insured: boolean;
  insuranceValue: number;
  shippingCost: number;
  packageWeight: number; // in kg
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  internationalDetails?: {
    customsValue: number;
    customsDeclaration: string;
    country_of_origin: string;
  };
}
