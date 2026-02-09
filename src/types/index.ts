export type TeaGrade = 'A' | 'B' | 'C';

export type FarmerStatus = 'active' | 'inactive';

export type BatchStatus = 'pending' | 'processing' | 'processed' | 'sold';

export type OutputPreference = 'self-collect' | 'coop-sell';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  location: string;
  registrationDate: string;
  status: FarmerStatus;
  outputPreference: OutputPreference;
  totalDelivered: number;
  balance: number;
}

export interface IncomingBatch {
  id: string;
  farmerId: string;
  farmerName: string;
  date: string;
  rawWeight: number;
  grade: TeaGrade;
  moistureContent: number;
  pricePerKg: number;
  totalAmount: number;
  status: BatchStatus;
  notes?: string;
}

export interface ProcessedBatch {
  id: string;
  incomingBatchId: string;
  farmerId: string;
  farmerName: string;
  processedDate: string;
  inputWeight: number;
  outputWeight: number;
  grade: TeaGrade;
  processingLoss: number;
  qualityScore: number;
  packagingType: string;
  status: 'available' | 'reserved' | 'sold';
}

export interface Buyer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  totalPurchases: number;
  status: 'active' | 'inactive';
}

export interface Sale {
  id: string;
  buyerId: string;
  buyerName: string;
  processedBatchId: string;
  date: string;
  quantity: number;
  grade: TeaGrade;
  pricePerKg: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  farmerId: string;
  farmerName: string;
}

export interface DashboardStats {
  totalFarmers: number;
  activeFarmers: number;
  totalBuyers: number;
  pendingBatches: number;
  processedThisMonth: number;
  totalSalesThisMonth: number;
  inventoryValue: number;
  outstandingPayments: number;
}
