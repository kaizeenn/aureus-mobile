import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ArrowUp, ArrowDown, PieChart, Layers } from 'lucide-react';
import { Transaction } from '@/pages/Index';

interface TransactionByCategoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  selectedMonth: number;
  selectedYear: number;
  isAllTime?: boolean;
}

const TransactionByCategory: React.FC<TransactionByCategoryProps> = ({ 
  transactions, 
  onDeleteTransaction,
  selectedMonth,
  selectedYear,
  isAllTime = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');

  // Filter transactions
  const monthlyTransactions = transactions.filter(transaction => {
    if (isAllTime) return true;
    const date = new Date(transaction.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const categories = Array.from(new Set(monthlyTransactions.map(t => t.category))).sort();

  const filteredTransactions = monthlyTransactions.filter(transaction => {
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    return matchesCategory && matchesType;
  });

  // Group by category
  const transactionsByCategory = filteredTransactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = [];
    }
    acc[transaction.category].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const getCategoryTotal = (txs: Transaction[]) => txs.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
       {/* Filter Header */}
       <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card/50 p-4 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-primary/20 rounded-lg">
                <Layers className="h-5 w-5 text-primary-foreground" />
             </div>
             <div>
                <h3 className="font-display font-bold text-lg leading-none">Breakdown</h3>
                <p className="text-xs text-muted-foreground">Per Kategori</p>
             </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
             <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
                <SelectTrigger className="w-full sm:w-[140px] bg-background border-primary/20">
                   <SelectValue />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">Semua Tipe</SelectItem>
                   <SelectItem value="income">Pemasukan</SelectItem>
                   <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
             </Select>
             
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[160px] bg-background border-primary/20">
                   <SelectValue />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">Semua Kategori</SelectItem>
                   {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                   ))}
                </SelectContent>
             </Select>
          </div>
       </div>

       {/* Masonry / Grid Layout for Categories */}
       {Object.keys(transactionsByCategory).length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-primary/20 rounded-2xl bg-muted/20">
             <PieChart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4 animate-spin-slow" />
             <p className="text-muted-foreground font-medium">Tidak ada data untuk ditampilkan</p>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {Object.entries(transactionsByCategory).map(([category, categoryTransactions]) => {
                const totalIncome = categoryTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const totalExpense = categoryTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                
                return (
                   <div key={category} className="group relative bg-card border border-primary/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      {/* Card Header with Totals */}
                      <div className="bg-gradient-to-r from-muted/50 to-muted/10 p-4 border-b border-primary/5 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-sm font-bold bg-background px-3 py-1 border-primary/20">
                               {category}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono bg-background/50 px-2 py-0.5 rounded-full">
                               {categoryTransactions.length} item
                            </span>
                         </div>
                         <div className="text-right flex flex-col items-end text-xs font-mono">
                            {totalIncome > 0 && <span className="text-success flex items-center gap-1"><ArrowUp className="h-3 w-3"/> {totalIncome.toLocaleString()}</span>}
                            {totalExpense > 0 && <span className="text-destructive flex items-center gap-1"><ArrowDown className="h-3 w-3"/> {totalExpense.toLocaleString()}</span>}
                         </div>
                      </div>

                      {/* Receipt-style List */}
                      <div className="p-0">
                         {categoryTransactions.slice(0, 5).map((t, idx) => (
                            <div key={t.id} className="flex justify-between items-center p-3 border-b border-dashed border-primary/10 last:border-0 hover:bg-primary/5 transition-colors text-sm">
                               <div className="flex flex-col min-w-0 pr-2">
                                  <span className="truncate font-medium text-foreground/90">{t.description || "Tanpa Keterangan"}</span>
                                  <span className="text-[10px] text-muted-foreground">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                               </div>
                               <div className="flex items-center gap-2 shrink-0">
                                  <span className={`font-mono font-bold ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                                     {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                                  </span>
                                  <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="h-6 w-6 text-muted-foreground/50 hover:text-destructive -mr-2"
                                     onClick={() => {
                                        if(confirm("Hapus?")) onDeleteTransaction(t.id)
                                     }}
                                  >
                                     <X className="h-3 w-3" />
                                  </Button>
                               </div>
                            </div>
                         ))}
                         {categoryTransactions.length > 5 && (
                            <div className="p-2 text-center bg-muted/20 text-xs text-muted-foreground italic">
                               ...dan {categoryTransactions.length - 5} lainnya
                            </div>
                         )}
                      </div>
                      
                      {/* Decorative Zigzag Bottom (Receipt look) */}
                      <div className="h-2 w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMiA0IiBwcmVzZXJ2ZUFzcGVjdHJhdGlvPSJub25lIj48cGF0aCBkPSJNIDAgMCBMIDYgNCBMIDEyIDAgWiIgZmlsbD0iI2Y1ZjVkYyIvPjwvc3ZnPg==')] bg-contain bg-bottom opacity-50"></div>
                   </div>
                );
             })}
          </div>
       )}
    </div>
  );
};

export default TransactionByCategory;