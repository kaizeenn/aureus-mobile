import { BackupData, Wallet, Transaction, Category } from '@/types';

export const exportToJson = (data: BackupData): string => {
  return JSON.stringify(data, null, 2);
};

export const downloadBackup = (data: BackupData, filename?: string) => {
  const jsonString = exportToJson(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `aureus-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromJson = (jsonString: string): BackupData | null => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate backup structure
    if (!data.version || !data.timestamp || !data.wallets || !data.transactions || !data.categories) {
      return null;
    }
    
    return data as BackupData;
  } catch {
    return null;
  }
};

export const createBackup = (
  wallets: Wallet[],
  transactions: Transaction[],
  categories: Category[]
): BackupData => {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    wallets,
    transactions,
    categories,
  };
};

export const calculateWalletBalance = (
  walletId: string,
  transactions: Transaction[]
): number => {
  return transactions.reduce((balance, transaction) => {
    if (transaction.type === 'income') {
      return transaction.walletId === walletId
        ? balance + transaction.amount
        : balance;
    }

    if (transaction.type === 'expense') {
      return transaction.walletId === walletId
        ? balance - transaction.amount
        : balance;
    }

    if (transaction.type === 'transfer') {
      if (transaction.fromWalletId === walletId) {
        return balance - transaction.amount;
      }
      if (transaction.toWalletId === walletId) {
        return balance + transaction.amount;
      }
    }

    return balance;
  }, 0);
};

export const getTotalBalance = (wallets: Wallet[]): number => {
  return wallets.reduce((total, wallet) => total + wallet.balance, 0);
};
