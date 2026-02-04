import React from 'react';
import { Wallet, Category, Transaction } from '@/types';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import BackupRestoreComponent from '@/components/BackupRestore';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackupRestorePageProps {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  onRestore: (data: { wallets: Wallet[]; transactions: Transaction[]; categories: Category[] }) => void;
  onBack: () => void;
}

const BackupRestorePage: React.FC<BackupRestorePageProps> = ({
  wallets,
  transactions,
  categories,
  onRestore,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" />
      </div>

      {/* Persistent Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content - with bottom nav spacing */}
      <main className="pb-nav custom-scrollbar relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <h2 className="text-lg font-semibold">Backup & Restore</h2>
          </div>

          {/* Backup & Restore Section */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <BackupRestoreComponent
              wallets={wallets}
              transactions={transactions}
              categories={categories}
              onRestore={onRestore}
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab="more" onTabChange={() => {}} />
    </div>
  );
};

export default BackupRestorePage;
