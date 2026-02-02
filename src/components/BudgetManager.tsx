
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Circle, AlertCircle, Check, X, Square } from 'lucide-react';
import { Transaction, Budget } from '@/pages/Index';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
  selectedMonth: number;
  selectedYear: number;
}

const CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Hashihan',
  'Investasi',
  'Lainnya'
];

const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  transactions,
  onAddBudget,
  onDeleteBudget,
  selectedMonth,
  selectedYear
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: ''
  });

  // Filter budgets and transactions for selected month/year
  const monthlyBudgets = budgets.filter(b => 
    b.month === selectedMonth && b.year === selectedYear
  );

  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === selectedMonth && 
           date.getFullYear() === selectedYear &&
           t.type === 'expense';
  });

  const handleAddBudget = () => {
    if (newBudget.category && newBudget.amount) {
      onAddBudget({
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        month: selectedMonth,
        year: selectedYear
      });
      setNewBudget({ category: '', amount: '' });
      setShowForm(false);
    }
  };

  const getBudgetStatus = (budget: Budget) => {
    const spent = monthlyTransactions
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;
    
    return { spent, percentage, remaining };
  };

  const totalBudget = monthlyBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = monthlyBudgets.reduce((sum, b) => {
    const { spent } = getBudgetStatus(b);
    return sum + spent;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Budget Overview - Neumorphic Card */}
      <div className="neumorphic-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2  bg-primary/10">
              <Square className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Budget Overview</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedYear, selectedMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="transition-smooth hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Budget
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4  bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Budget</p>
            <p className="text-xl font-bold text-primary">
              Rp {totalBudget.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-center p-4  bg-destructive/5 border border-destructive/10">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Pengeluaran</p>
            <p className="text-xl font-bold text-destructive">
              Rp {totalSpent.toLocaleString('id-ID')}
            </p>
          </div>
          <div className={`text-center p-4  border ${
            totalBudget - totalSpent >= 0 
              ? 'bg-success/5 border-success/10' 
              : 'bg-destructive/5 border-destructive/10'
          }`}>
            <p className={`text-sm font-medium mb-1 ${
              totalBudget - totalSpent >= 0 
                ? 'text-muted-foreground' 
                : 'text-muted-foreground'
            }`}>
              Sisa Budget
            </p>
            <p className={`text-xl font-bold ${
              totalBudget - totalSpent >= 0 
                ? 'text-success' 
                : 'text-destructive'
            }`}>
              Rp {Math.abs(totalBudget - totalSpent).toLocaleString('id-ID')}
              {totalBudget - totalSpent < 0 && ' (Over)'}
            </p>
          </div>
        </div>

        {/* Add Budget Form */}
        {showForm && (
          <div className="neumorphic-inset p-4  animate-slide-up">
            <h3 className="font-medium mb-4 text-foreground">Tambah Budget Baru</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={newBudget.category} onValueChange={(value) => setNewBudget(prev => ({...prev, category: value}))}>
                <SelectTrigger className="neumorphic-inset">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Jumlah Budget"
                value={newBudget.amount}
                onChange={(e) => setNewBudget(prev => ({...prev, amount: e.target.value}))}
                className="neumorphic-inset"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddBudget} size="sm" className="flex-1">
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} size="sm">
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Budget Details */}
      {monthlyBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthlyBudgets.map(budget => {
            const { spent, percentage, remaining } = getBudgetStatus(budget);
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;
            
            return (
              <div key={budget.id} className="neumorphic-card p-5 transition-smooth hover:scale-[1.02]">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    {isOverBudget ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : isNearLimit ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Check className="h-5 w-5 text-success" />
                    )}
                    <h3 className="font-semibold text-foreground">{budget.category}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteBudget(budget.id)}
                    className="text-destructive hover:text-destructive/80 p-1 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pengeluaran</span>
                    <span className="font-medium text-foreground">
                      Rp {spent.toLocaleString('id-ID')} / Rp {budget.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={`h-2 ${
                      isOverBudget ? '[&>div]:bg-destructive' : 
                      isNearLimit ? '[&>div]:bg-yellow-500' : 
                      '[&>div]:bg-success'
                    }`}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{percentage.toFixed(1)}% terpakai</span>
                    <span className={remaining >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                      {remaining >= 0 ? `Sisa: Rp ${remaining.toLocaleString('id-ID')}` : `Over: Rp ${Math.abs(remaining).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="neumorphic-card p-12 text-center">
          <Circle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">Belum ada budget yang ditetapkan</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Mulai buat budget untuk kontrol keuangan yang lebih baik!</p>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;
