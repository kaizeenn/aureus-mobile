
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
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
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
          
          {/* Tab Content Based on Bottom Navigation */}
          <section className="animate-fade-in">
            {activeTab === 'home' && (
              <div className="space-y-6">
                {/* Floating Action Buttons - PALING ATAS */}
                <div className="flex justify-center gap-6 animate-scale-in">
                  <div className="flex flex-col items-center">
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg transition-smooth hover:scale-110 hover:shadow-xl"
                      size="icon"
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                    <span className="text-xs text-muted-foreground mt-2 font-medium">Manual</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Button 
                      onClick={() => setShowVoiceInput(true)}
                      className="w-16 h-16 rounded-full bg-gradient-bg hover:opacity-90 text-white shadow-lg transition-smooth hover:scale-110 hover:shadow-xl"
                      size="icon"
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                    <span className="text-xs text-muted-foreground mt-2 font-medium">Voice</span>
                  </div>
                </div>

                {/* Month/Year Selector - KEDUA */}
                <div className="neumorphic-card p-4">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">Periode:</span>
                    </div>
                    <div className="flex gap-3">
                      <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                        <SelectTrigger className="w-[140px] neumorphic-inset">
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
                        <SelectTrigger className="w-[100px] neumorphic-inset">
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

                {/* Hero Balance Section - PALING BAWAH */}
                <TransactionSummary transactions={transactions} />
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
                <StatisticsChart transactions={transactions} />
                
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
