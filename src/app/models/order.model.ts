import { SubService } from './sub-service.model';

export interface Order {
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
  billTo: string;
  billToAccount: string;
  maxillary: string | null;
  mandibular: string | null;
  format: string | null;
  amountBilled: number;
  vouchers: string;
  receivedTime: string;
  sentTime: string;
  updateTime: string;
  updateStatus: string;
  chargedOn: string;
  action: string;
  changeRequest: string;
  csTask: string | null;
  subServices: SubService[];
}
