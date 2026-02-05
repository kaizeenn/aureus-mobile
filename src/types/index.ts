// Types and interfaces for the financial app

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'digital';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  date: string;
  walletId: string; // Which wallet this transaction belongs to
  fromWalletId?: string; // For transfer transactions
  toWalletId?: string; // For transfer transactions
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  isCustom: boolean;
  createdAt: string;
}

export interface BackupData {
  version: string;
  timestamp: string;
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
}

export interface AppState {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  selectedWalletId: string | null;
  theme: 'light' | 'dark' | 'system';
}
