
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mic, Calendar, DollarSign, Euro, JapaneseYen, PoundSterling, Bitcoin, Coins, CreditCard, Tags, HardDriveDownload, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav, { NavTab } from '@/components/BottomNav';
import TransactionForm from '@/components/TransactionForm';
import VoiceInput from '@/components/VoiceInput';
import TransactionTable from '@/components/TransactionTable';
import TransactionByCategory from '@/components/TransactionByCategory';
import StatisticsChart from '@/components/StatisticsChart';
import TransactionSummary from '@/components/TransactionSummary';
import MonthlyReports from '@/components/MonthlyReports';
import SmartInsights from '@/components/SmartInsights';
import SubscriptionManager from '@/components/SubscriptionManager';
import AccountManager from '@/components/AccountManager';
import TransferBetweenAccounts from '@/components/TransferBetweenAccounts';
import CategoriesPage from '@/pages/Categories';
import BackupRestoreComponent from '@/components/BackupRestore';
import { Wallet, Category, Transaction } from '@/types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_WALLETS } from '@/lib/constants';
import { calculateWalletBalance } from '@/lib/backup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Index = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAllTime, setIsAllTime] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentPage, setCurrentPage] = useState<'main' | 'categories'>('main');
  const [showBackupRestore, setShowBackupRestore] = useState(false);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const APP_VERSION = '2.0.0';
    const savedVersion = localStorage.getItem('appVersion');
    
    // Clear old data if version changed (emoji to text codes migration)
    if (savedVersion !== APP_VERSION) {
      localStorage.clear();
      localStorage.setItem('appVersion', APP_VERSION);
    }

    // Load wallets
    const savedWallets = localStorage.getItem('wallets');
    if (savedWallets) {
      try {
        const parsed = JSON.parse(savedWallets) as Wallet[];
        setWallets(parsed);
        if (parsed.length > 0 && !selectedWalletId) {
          setSelectedWalletId(parsed[0].id);
        }
      } catch {
        // Use default wallets if corrupted
        setWallets(DEFAULT_WALLETS);
        setSelectedWalletId(DEFAULT_WALLETS[0].id);
      }
    } else {
      setWallets(DEFAULT_WALLETS);
      setSelectedWalletId(DEFAULT_WALLETS[0].id);
    }

    // Load transactions
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions) as Transaction[];
        setTransactions(parsed);
      } catch {
        // ignore corrupted storage
      }
    }

    // Load categories
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories) as Category[];
        setCategories(parsed);
      } catch {
        // Use default categories
        setCategories([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]);
      }
    } else {
      setCategories([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]);
    }
  }, []);

  // Update wallet balances whenever transactions change
  useEffect(() => {
    setWallets(prev =>
      prev.map(wallet => ({
        ...wallet,
        balance: calculateWalletBalance(wallet.id, transactions),
      }))
    );
  }, [transactions]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      walletId: selectedWalletId || wallets[0]?.id || '',
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowForm(false);
    setShowVoiceInput(false);
  };

  const addTransfer = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addWallet = (wallet: Wallet) => {
    setWallets(prev => [...prev, wallet]);
    setSelectedWalletId(wallet.id);
  };

  const deleteWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
    if (selectedWalletId === id && wallets.length > 1) {
      setSelectedWalletId(wallets.find(w => w.id !== id)?.id || null);
    }
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleRestore = (restoredWallets: Wallet[], restoredTransactions: Transaction[], restoredCategories: Category[]) => {
    setWallets(restoredWallets);
    setTransactions(restoredTransactions);
    setCategories(restoredCategories);
    if (restoredWallets.length > 0) {
      setSelectedWalletId(restoredWallets[0].id);
    }
  };

  const availableYears = Array.from(
    new Set(transactions.map(t => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a);

  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

  // Get transactions for selected wallet or all
  const filteredTransactions = selectedWalletId
    ? transactions.filter(t => t.walletId === selectedWalletId || t.toWalletId === selectedWalletId)
    : transactions;

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  // Handle page navigation for separate pages
  if (currentPage === 'categories') {
    return (
      <CategoriesPage
        categories={categories}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
        onBack={() => {
          setCurrentPage('main');
          setActiveTab('more');
        }}
        onNavigateTab={(tab) => {
          setCurrentPage('main');
          setActiveTab(tab);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 relative overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground">
      
      {/* Background: Cartoony Money Pattern */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
         {[
            // Row 1
            { Icon: DollarSign, top: '2%', delay: '0s', duration: '40s' },
            { Icon: Bitcoin, top: '5%', delay: '12s', duration: '50s' },
            { Icon: Euro, top: '8%', delay: '25s', duration: '45s' },
            // Row 2
            { Icon: JapaneseYen, top: '12%', delay: '5s', duration: '55s' },
            { Icon: Coins, top: '15%', delay: '18s', duration: '38s' },
            { Icon: PoundSterling, top: '18%', delay: '30s', duration: '48s' },
            // Row 3
            { Icon: DollarSign, top: '22%', delay: '8s', duration: '42s' },
            { Icon: Euro, top: '25%', delay: '22s', duration: '52s' },
            { Icon: Bitcoin, top: '28%', delay: '2s', duration: '35s' },
            // Row 4
            { Icon: JapaneseYen, top: '32%', delay: '15s', duration: '60s' },
            { Icon: Coins, top: '35%', delay: '35s', duration: '46s' },
            { Icon: PoundSterling, top: '38%', delay: '10s', duration: '50s' },
            // Row 5
            { Icon: DollarSign, top: '42%', delay: '20s', duration: '44s' },
            { Icon: Euro, top: '45%', delay: '5s', duration: '58s' },
            { Icon: Bitcoin, top: '48%', delay: '28s', duration: '40s' },
            // Row 6
            { Icon: JapaneseYen, top: '52%', delay: '12s', duration: '54s' },
            { Icon: Coins, top: '55%', delay: '32s', duration: '48s' },
            { Icon: PoundSterling, top: '58%', delay: '3s', duration: '36s' },
            // Row 7
            { Icon: DollarSign, top: '62%', delay: '18s', duration: '56s' },
            { Icon: Euro, top: '65%', delay: '40s', duration: '42s' },
            { Icon: Bitcoin, top: '68%', delay: '8s', duration: '50s' },
            // Row 8
            { Icon: JapaneseYen, top: '72%', delay: '25s', duration: '62s' },
            { Icon: Coins, top: '75%', delay: '15s', duration: '45s' },
            { Icon: PoundSterling, top: '78%', delay: '0s', duration: '55s' },
            // Row 9
            { Icon: DollarSign, top: '82%', delay: '10s', duration: '48s' },
            { Icon: Euro, top: '85%', delay: '30s', duration: '38s' },
            { Icon: Bitcoin, top: '88%', delay: '5s', duration: '52s' },
            // Row 10
            { Icon: JapaneseYen, top: '92%', delay: '22s', duration: '46s' },
            { Icon: Coins, top: '95%', delay: '38s', duration: '60s' },
            { Icon: PoundSterling, top: '98%', delay: '12s', duration: '40s' },
         ].map((item, i) => (
            <div
               key={i}
               className="absolute left-[-10%] opacity-20 dark:opacity-10 text-primary animate-drift"
               style={{
                  top: item.top,
                  animationDelay: item.delay,
                  animationDuration: item.duration,
               }}
            >
               <item.Icon strokeWidth={2.5} className="w-6 h-6 sm:w-10 sm:h-10" />
            </div>
         ))}
      </div>

      {/* Persistent Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content - with bottom nav spacing */}
      <main className="pb-nav custom-scrollbar relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
          {/* Home Tab Actions */}
          {activeTab === 'home' && (
            <div className="flex gap-3">
              <Button onClick={() => setShowForm(true)} className="flex-1 gap-2 h-12 text-base shadow-md hover:shadow-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-5 w-5" />
                Catat Transaksi
              </Button>
              <Button onClick={() => setShowVoiceInput(true)} variant="outline" className="gap-2 h-12 text-base shadow-sm border-primary/20 bg-card hover:bg-accent/50 text-foreground">
                <Mic className="h-5 w-5 text-primary" />
                Suara
              </Button>
            </div>
          )}

          {/* Stats Tab Period Selector */}
          {activeTab === 'stats' && (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Periode Statistik</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className={`flex gap-2 transition-all duration-300 ${isAllTime ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger className="w-[130px] h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="w-[90px] h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tab Content Based on Bottom Navigation */}
          <section>
            {activeTab === 'home' && (
              <div className="space-y-6">
                <TransactionSummary 
                  transactions={filteredTransactions} 
                  isAllTime={isAllTime} 
                  setIsAllTime={setIsAllTime}
                />
                <SmartInsights transactions={filteredTransactions} />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Saldo Semua Akun</p>
                      <p className="text-2xl font-semibold">Rp {totalBalance.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
                {/* Transaction Table - MOVED TO STATS */}
                <TransactionTable 
                  transactions={filteredTransactions}
                  onDeleteTransaction={deleteTransaction}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
                
                {/* Statistics Chart */}
                <StatisticsChart
                  transactions={filteredTransactions}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
                
                {/* Transaction by Category */}
                <TransactionByCategory 
                  transactions={filteredTransactions}
                  onDeleteTransaction={deleteTransaction}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
              </div>
            )}

            {activeTab === 'subs' && (
              <SubscriptionManager onAddTransaction={addTransaction} />
            )}

            {activeTab === 'reports' && (
              <MonthlyReports transactions={filteredTransactions} />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Akun
                  </h2>
                </div>
                
                {/* Accounts Section */}
                <div className="rounded-lg border bg-card p-4 space-y-4">
                  <AccountManager
                    wallets={wallets}
                    selectedWalletId={selectedWalletId}
                    onAddWallet={addWallet}
                    onDeleteWallet={deleteWallet}
                    onSelectWallet={setSelectedWalletId}
                  />
                </div>

                {/* Transfer Section */}
                <div className="rounded-lg border bg-card p-4 space-y-4">
                  <TransferBetweenAccounts
                    wallets={wallets}
                    onTransfer={addTransfer}
                  />
                </div>
              </div>
            )}

            {activeTab === 'more' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Button
                    onClick={() => setCurrentPage('categories')}
                    className="h-14 w-full justify-between px-4"
                    variant="outline"
                  >
                    <span className="flex items-center gap-3 text-base">
                      <Tags className="h-5 w-5" />
                      Kelola Kategori
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    onClick={() => setShowBackupRestore(true)}
                    className="h-14 w-full justify-between px-4"
                    variant="outline"
                  >
                    <span className="flex items-center gap-3 text-base">
                      <HardDriveDownload className="h-5 w-5" />
                      Backup & Restore
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          onAddTransaction={addTransaction}
          onClose={() => setShowForm(false)}
          wallets={wallets}
          categories={categories}
          selectedWalletId={selectedWalletId}
        />
      )}

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <VoiceInput
          onAddTransaction={addTransaction}
          onClose={() => setShowVoiceInput(false)}
          categories={categories}
        />
      )}

      {/* Backup & Restore Dialog */}
      <Dialog open={showBackupRestore} onOpenChange={setShowBackupRestore}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Backup & Restore Data</DialogTitle>
          </DialogHeader>
          <BackupRestoreComponent
            wallets={wallets}
            transactions={transactions}
            categories={categories}
            onRestore={(wallets, transactions, categories) => {
              setWallets(wallets);
              setTransactions(transactions);
              setCategories(categories);
              if (wallets.length > 0) {
                setSelectedWalletId(wallets[0].id);
              }
              setShowBackupRestore(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
