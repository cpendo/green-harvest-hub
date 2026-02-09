import { Farmer, IncomingBatch, ProcessedBatch, Buyer, Sale } from '@/types';

export const mockFarmers: Farmer[] = [
  {
    id: 'F001',
    name: 'James Mwangi',
    phone: '+254 712 345 678',
    location: 'Kericho Valley',
    registrationDate: '2023-01-15',
    status: 'active',
    outputPreference: 'coop-sell',
    totalDelivered: 2450,
    balance: 125000,
  },
  {
    id: 'F002',
    name: 'Sarah Wanjiku',
    phone: '+254 723 456 789',
    location: 'Nandi Hills',
    registrationDate: '2023-02-20',
    status: 'active',
    outputPreference: 'self-collect',
    totalDelivered: 1820,
    balance: 45000,
  },
  {
    id: 'F003',
    name: 'Peter Omondi',
    phone: '+254 734 567 890',
    location: 'Kisii Highlands',
    registrationDate: '2023-03-10',
    status: 'active',
    outputPreference: 'coop-sell',
    totalDelivered: 3100,
    balance: 189000,
  },
  {
    id: 'F004',
    name: 'Grace Njeri',
    phone: '+254 745 678 901',
    location: 'Limuru',
    registrationDate: '2023-04-05',
    status: 'active',
    outputPreference: 'coop-sell',
    totalDelivered: 980,
    balance: 67000,
  },
  {
    id: 'F005',
    name: 'David Kiprop',
    phone: '+254 756 789 012',
    location: 'Bomet',
    registrationDate: '2023-05-12',
    status: 'inactive',
    outputPreference: 'self-collect',
    totalDelivered: 560,
    balance: 0,
  },
];

export const mockIncomingBatches: IncomingBatch[] = [
  {
    id: 'IB001',
    farmerId: 'F001',
    farmerName: 'James Mwangi',
    date: '2024-01-15',
    rawWeight: 250,
    grade: 'A',
    moistureContent: 72,
    pricePerKg: 85,
    totalAmount: 21250,
    status: 'processed',
  },
  {
    id: 'IB002',
    farmerId: 'F002',
    farmerName: 'Sarah Wanjiku',
    date: '2024-01-16',
    rawWeight: 180,
    grade: 'B',
    moistureContent: 68,
    pricePerKg: 75,
    totalAmount: 13500,
    status: 'processing',
  },
  {
    id: 'IB003',
    farmerId: 'F003',
    farmerName: 'Peter Omondi',
    date: '2024-01-17',
    rawWeight: 320,
    grade: 'A',
    moistureContent: 70,
    pricePerKg: 85,
    totalAmount: 27200,
    status: 'pending',
  },
  {
    id: 'IB004',
    farmerId: 'F004',
    farmerName: 'Grace Njeri',
    date: '2024-01-18',
    rawWeight: 150,
    grade: 'C',
    moistureContent: 75,
    pricePerKg: 60,
    totalAmount: 9000,
    status: 'pending',
  },
  {
    id: 'IB005',
    farmerId: 'F001',
    farmerName: 'James Mwangi',
    date: '2024-01-19',
    rawWeight: 200,
    grade: 'A',
    moistureContent: 71,
    pricePerKg: 85,
    totalAmount: 17000,
    status: 'processed',
  },
];

export const mockProcessedBatches: ProcessedBatch[] = [
  {
    id: 'PB001',
    incomingBatchId: 'IB001',
    farmerId: 'F001',
    farmerName: 'James Mwangi',
    processedDate: '2024-01-17',
    inputWeight: 250,
    outputWeight: 62.5,
    grade: 'A',
    processingLoss: 75,
    qualityScore: 92,
    packagingType: '25kg bags',
    status: 'available',
  },
  {
    id: 'PB002',
    incomingBatchId: 'IB005',
    farmerId: 'F001',
    farmerName: 'James Mwangi',
    processedDate: '2024-01-21',
    inputWeight: 200,
    outputWeight: 52,
    grade: 'A',
    processingLoss: 74,
    qualityScore: 94,
    packagingType: '25kg bags',
    status: 'sold',
  },
];

export const mockBuyers: Buyer[] = [
  {
    id: 'B001',
    companyName: 'Kenya Tea Exporters Ltd',
    contactPerson: 'John Kamau',
    email: 'john@ktexporters.co.ke',
    phone: '+254 720 111 222',
    address: 'Mombasa Road, Nairobi',
    registrationDate: '2023-01-01',
    totalPurchases: 2500000,
    status: 'active',
  },
  {
    id: 'B002',
    companyName: 'Highland Blends Co.',
    contactPerson: 'Mary Wangari',
    email: 'mary@highlandblends.com',
    phone: '+254 721 222 333',
    address: 'Industrial Area, Nakuru',
    registrationDate: '2023-03-15',
    totalPurchases: 1800000,
    status: 'active',
  },
  {
    id: 'B003',
    companyName: 'African Tea Trading',
    contactPerson: 'Ahmed Hassan',
    email: 'ahmed@africanteaTrading.com',
    phone: '+254 722 333 444',
    address: 'Kenyatta Avenue, Eldoret',
    registrationDate: '2023-06-20',
    totalPurchases: 950000,
    status: 'active',
  },
];

export const mockSales: Sale[] = [
  {
    id: 'S001',
    buyerId: 'B001',
    buyerName: 'Kenya Tea Exporters Ltd',
    processedBatchId: 'PB002',
    date: '2024-01-22',
    quantity: 52,
    grade: 'A',
    pricePerKg: 450,
    totalAmount: 23400,
    paymentStatus: 'paid',
    farmerId: 'F001',
    farmerName: 'James Mwangi',
  },
  {
    id: 'S002',
    buyerId: 'B002',
    buyerName: 'Highland Blends Co.',
    processedBatchId: 'PB001',
    date: '2024-01-23',
    quantity: 30,
    grade: 'A',
    pricePerKg: 440,
    totalAmount: 13200,
    paymentStatus: 'pending',
    farmerId: 'F001',
    farmerName: 'James Mwangi',
  },
];

export const getStorageData = <T>(key: string, defaultData: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

export const setStorageData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const generateId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};
