
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mic, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav, { NavTab } from '@/components/BottomNav';
import AboutSection from '@/components/AboutSection';
import TransactionForm from '@/components/TransactionForm';
import VoiceInput from '@/components/VoiceInput';
import TransactionTable from '@/components/TransactionTable';
import TransactionByCategory from '@/components/TransactionByCategory';
import StatisticsChart from '@/components/StatisticsChart';
import TransactionSummary from '@/components/TransactionSummary';
import MonthlyReports from '@/components/MonthlyReports';
import SmartInsights from '@/components/SmartInsights';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (!savedTransactions) return;
    try {
      const parsed = JSON.parse(savedTransactions);
      if (!Array.isArray(parsed)) return;

      const normalizeStoredTransaction = (value: unknown): Transaction | null => {
        if (typeof value !== 'object' || value === null) return null;
        const t = value as Record<string, unknown>;

        const type =
          t.type === 'income' ? 'income' : t.type === 'expense' ? 'expense' : null;
          if (!type) return null;

        const amount =
          typeof t.amount === 'number'
            ? t.amount
            : Number.parseFloat(String(t.amount ?? ''));
        if (!Number.isFinite(amount)) return null;

        const rawCategory = typeof t.category === 'string' ? t.category : '';
        const category = rawCategory === 'Hashihan' ? 'Tagihan' : rawCategory;

        const description = typeof t.description === 'string' ? t.description : '';
        const dateString =
          typeof t.date === 'string' ? t.date : new Date().toISOString();
        const date = Number.isNaN(new Date(dateString).getTime())
          ? new Date().toISOString()
          : dateString;

        const id =
          typeof t.id === 'string' && t.id.length > 0
            ? t.id
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        return { id, type, amount, category, description, date };
      };

      const normalized: Transaction[] = parsed
        .map(normalizeStoredTransaction)
        .filter(Boolean) as Transaction[];

      setTransactions(normalized);
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowForm(false);
    setShowVoiceInput(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const availableYears = Array.from(
    new Set(transactions.map(t => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a);

  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Persistent Header */}
      <Header />

      {/* Main Content - with bottom nav spacing */}
      <main className="pb-nav custom-scrollbar">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
          {(activeTab === 'home' || activeTab === 'stats') && (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Periode</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger className="w-[150px]">
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
                    <SelectTrigger className="w-[110px]">
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

                {activeTab === 'home' && (
                  <div className="flex gap-2 sm:ml-auto">
                    <Button onClick={() => setShowForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah
                    </Button>
                    <Button onClick={() => setShowVoiceInput(true)} variant="secondary" className="gap-2">
                      <Mic className="h-4 w-4" />
                      Suara
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tab Content Based on Bottom Navigation */}
          <section>
            {activeTab === 'home' && (
              <div className="space-y-6">
                <TransactionSummary transactions={transactions} />
                <SmartInsights transactions={transactions} />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Transaction Table - MOVED TO STATS */}
                <TransactionTable 
                  transactions={transactions}
                  onDeleteTransaction={deleteTransaction}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
                
                {/* Statistics Chart */}
                <StatisticsChart
                  transactions={transactions}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
                
                {/* Transaction by Category */}
                <TransactionByCategory 
                  transactions={transactions}
                  onDeleteTransaction={deleteTransaction}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
              </div>
            )}

            {activeTab === 'reports' && (
              <MonthlyReports transactions={transactions} />
            )}

            {activeTab === 'more' && (
              <div className="space-y-6">
                <AboutSection />
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
        />
      )}

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <VoiceInput
          onAddTransaction={addTransaction}
          onClose={() => setShowVoiceInput(false)}
        />
      )}
    </div>
  );
};

export default Index;
