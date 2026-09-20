export type UserRole = 'ADMIN' | 'RETAILER';

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  retailerId: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface DistributorProfile {
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export interface Retailer {
  id: string;
  businessName: string;
  retailerName: string;
  mobileNumber: string;
  alternatePhone?: string;
  email?: string;
  pinHash: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  creditLimit: number;
  outstandingAmount: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Product {
  id: string;
  itemCode: string;
  itemName: string;
  alias: string;
  company: string;
  category: string; // Fungicides, Insecticides, Fertilizers, Seeds, Herbicides, Bio-Nutrients
  subCategory: string;
  unit: string; // Bottle, Pkt, Bag, Kg, Ltr
  packSize: string;
  packing: string;
  purchaseRate: number;
  sellingRate: number;
  mrp: number;
  gstPercent: number;
  hsnCode: string;
  barcode: string;
  openingStock: number;
  currentStock: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  contactPerson: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  itemCode: string;
  itemName: string;
  packSize: string;
  quantity: number;
  rate: number;
  gstPercent: number;
  total: number;
  imageUrl: string;
}

export interface Order {
  id: string; // e.g. ORD-2026-104821
  retailerId: string;
  retailerName: string;
  retailerBusinessName: string;
  retailerMobile: string;
  dateTime: number;
  items: OrderItem[];
  subTotal: number;
  gstTotal: number;
  grandTotal: number;
  notes: string;
  status: OrderStatus;
  adminNotes: string;
  updatedAt: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  retailerId: string;
  retailerName: string;
  billDate: number;
  amount: number;
  pdfUrl: string;
  originalFileName: string;
  createdAt: number;
}

export interface PassbookEntry {
  id: string;
  retailerId: string;
  date: number;
  invoiceNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface Statement {
  id: string;
  retailerId: string;
  retailerName: string;
  documentType: string; // 'Account Statement' | 'Passbook' | 'Other'
  title: string;
  period: string;
  pdfUrl: string;
  originalFileName: string;
  uploadedAt: number;
}

export interface Poster {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  fileType: 'IMAGE' | 'PDF';
  startDate: number;
  endDate: number;
  priority: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  notificationTitle: string;
  notificationMessage: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  targetRetailerId: string; // "ALL" or retailerId or "ADMIN"
  linkedType: 'NONE' | 'ORDER' | 'BILL' | 'PASSBOOK' | 'STATEMENT' | 'POSTER' | 'PAYMENT_REMINDER';
  linkedId: string;
  timestamp: number;
  isRead: boolean;
}

export interface PaymentReminder {
  id: string;
  retailerId: string;
  retailerName: string;
  retailerMobile: string;
  outstandingAmount: number;
  dueDate: number;
  message: string;
  createdAt: number;
  isPaid: boolean;
  snoozedUntil?: number;
}

export interface ImportHistoryItem {
  id: string;
  fileName: string;
  adminName: string;
  timestamp: number;
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  errorReport: string[];
  stockImportMode: 'REPLACE' | 'ADD';
}

export interface CartItem {
  product: Product;
  quantity: number;
}
