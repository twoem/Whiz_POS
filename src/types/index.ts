export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  cashier: string;
  creditCustomer?: string;
  status: 'completed' | 'pending' | 'refunded';
}

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  totalCredit: number;
  paidAmount: number;
  balance: number;
  transactions: string[];
  createdAt: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  timestamp: string;
  cashier: string;
  receipt?: string;
}

export interface BusinessSetup {
  businessName: string;
  businessId: string;
  apiKey: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  receiptHeader: string;
  receiptFooter: string;
  printerType: string;
  isSetup: boolean;
  createdAt: string;
}
