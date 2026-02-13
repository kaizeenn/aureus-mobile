import { BackupData, Wallet, Transaction, Category } from '@/types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const exportToJson = (data: BackupData): string => {
  return JSON.stringify(data, null, 2);
};

export const downloadBackup = async (data: BackupData, filename?: string) => {
  const jsonString = exportToJson(data);
  const defaultFilename = filename || `aureus-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  // Check if running on native platform (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      // Save to app's cache directory first
      const result = await Filesystem.writeFile({
        path: defaultFilename,
        data: jsonString,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      // Get the file URI
      const fileUri = result.uri;

      // Use Share API to let user choose where to save
      await Share.share({
        title: 'Simpan Backup',
        text: 'Backup data Aureus',
        url: fileUri,
        dialogTitle: 'Pilih lokasi penyimpanan',
      });

      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      // Fallback to browser download if native fails
      browserDownload(jsonString, defaultFilename);
      return false;
    }
  } else {
    // Web browser - use standard download
    browserDownload(jsonString, defaultFilename);
    return true;
  }
};

// Helper function for browser download
const browserDownload = (jsonString: string, filename: string) => {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
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
