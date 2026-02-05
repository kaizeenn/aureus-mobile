import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { X, ArrowUp, ArrowDown, Wallet } from 'lucide-react';
import { Transaction } from '@/pages/Index';
import { Wallet as WalletType } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  wallets: WalletType[];
  onDeleteTransaction: (id: string) => void;
  selectedMonth: number;
  selectedYear: number;
  isAllTime?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions,
  wallets,
  onDeleteTransaction,
  selectedMonth,
  selectedYear,
  isAllTime = false
}) => {
  const [showIncome, setShowIncome] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);

  // Filter transactions by selected month and year
  const monthlyTransactions = transactions.filter(transaction => {
    if (isAllTime) return true;
    const date = new Date(transaction.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const filteredTransactions = monthlyTransactions.filter(transaction => 
    showIncome ? transaction.type === 'income' : transaction.type === 'expense'
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
    <Card className="border-2 border-primary/20 shadow-sm relative z-0">
      <CardHeader className="bg-muted/30 pb-4 border-b border-primary/10 rounded-t-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Wallet className="h-5 w-5 text-primary" />
            Buku Besar
          </CardTitle>

          <ToggleGroup
            type="single"
            value={showIncome ? 'income' : 'expense'}
            onValueChange={(v) => {
              if (!v) return;
              setShowIncome(v === 'income');
            }}
            className="bg-background/50 p-1 rounded-lg border border-primary/20"
          >
            <ToggleGroupItem 
              value="income" 
              className="data-[state=on]:bg-success data-[state=on]:text-success-foreground hover:bg-success/20 transition-all px-4"
            >
              Pemasukan
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="expense" 
              className="data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground hover:bg-destructive/20 transition-all px-4"
            >
              Pengeluaran
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mt-4 flex items-end justify-between bg-background p-4 rounded-xl border border-dashed border-primary/30 relative overflow-hidden group">
            <div className={`absolute inset-0 opacity-10 ${showIncome ? 'bg-success' : 'bg-destructive'}`}></div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total {showIncome ? 'Masuk' : 'Keluar'}</p>
                <p className={`text-3xl font-display font-black tracking-tighter ${showIncome ? 'text-success' : 'text-destructive'}`}>
                    Rp {totalAmount.toLocaleString('id-ID')}
                </p>
            </div>
            {showIncome ? (
                <ArrowUp className="h-12 w-12 text-success/20 absolute -right-2 -bottom-2 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            ) : (
                <ArrowDown className="h-12 w-12 text-destructive/20 absolute -right-2 -bottom-2 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/10 min-h-[300px] rounded-b-xl">
             <div className="w-32 h-32 rounded-full bg-muted/30 flex items-center justify-center mb-4 animate-float">
                {showIncome ? (
                    // Sleeping Piggy Bank SVG
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-muted-foreground/50">
                       <path d="M19 5c-1.5 0-2.8 0.6-3.8 1.5l-2.2 2.1c-0.2-0.5-0.7-0.9-1.3-1c-0.2-0.8-0.9-1.5-1.8-1.5h-0.9c-0.6-1.5-2.1-2.6-3.8-2.6C3 3.5 1.5 5 1.5 7v4c0 1.2 0.5 2.2 1.3 2.9l1.1 5.1h2.2l0.4-3h4l0.4 3h2.2l1.6-7.5c1.4-0.6 2.4-1.9 2.4-3.5S20.5 5 19 5z M8.5 7c0.6 0 1 0.4 1 1s-0.4 1-1 1s-1-0.4-1-1S7.9 7 8.5 7z"/>
                       <path d="M16 4v-1" strokeLinecap="round"/>
                       <path d="M17 4v-1" strokeLinecap="round"/>
                       <path d="M14 6h1" strokeLinecap="round"/>
                    </svg>
                ) : (
                    // Empty Wallet / Cobweb SVG
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-muted-foreground/50">
                       <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
                       <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
                       <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
                       {/* Cobweb decoration */}
                       <path d="M4 22l4-4" className="opacity-50"/>
                       <path d="M8 22l-4-4" className="opacity-50"/>
                    </svg>
                )}
             </div>
            <p className="text-lg font-medium font-display">
                {showIncome ? "Zzz... Belum Ada Pemasukan" : "Dompet Masih Aman"}
            </p>
            <p className="text-sm opacity-70">
                {showIncome ? "Piggy bank-nya masih tidur." : "Belum ada laba-laba yang bersarang."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
             {filteredTransactions.map((transaction) => (
                 <div 
                    key={transaction.id}
                    onClick={() => setDetailTransaction(transaction)}
                    className="group flex items-center justify-between p-4 hover:bg-primary/5 transition-colors duration-200 relative cursor-pointer"
                 >
                    {/* Hover Decoration */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center"></div>

                    <div className="flex items-center gap-4 flex-1 min-w-0">
                         {/* Date Box */}
                         <div className="flex flex-col items-center justify-center bg-muted/30 border border-primary/10 rounded-lg h-12 w-12 shrink-0">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none">
                              {new Date(transaction.date).toLocaleDateString('id-ID', { month: 'short' })}
                            </span>
                            <span className="text-lg font-black leading-none">
                              {new Date(transaction.date).getDate()}
                            </span>
                         </div>

                         <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-primary/20 bg-primary/5 text-foreground/70 font-normal">
                                    {transaction.category}
                                </Badge>
                             </div>
                             <p className="text-sm font-medium truncate text-foreground/90 font-display">
                                {transaction.description || 'Tanpa Keterangan'}
                             </p>
                         </div>
                    </div>

                    <div className="flex items-center gap-4 pl-4">
                        <span className={`text-sm sm:text-base font-bold tabular-nums ${showIncome ? 'text-success' : 'text-destructive'}`}>
                            {showIncome ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                        </span>
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Hapus pencatatan ini?')) {
                                    onDeleteTransaction(transaction.id);
                                }
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
             ))}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Transaction Detail Dialog */}
    <Dialog open={!!detailTransaction} onOpenChange={(open) => !open && setDetailTransaction(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>
        {detailTransaction && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Jumlah</span>
              <span className={`font-bold text-lg tabular-nums ${detailTransaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                {detailTransaction.type === 'income' ? '+' : '-'} Rp {detailTransaction.amount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tipe</span>
                <Badge variant={detailTransaction.type === 'income' ? 'default' : 'destructive'}>
                  {detailTransaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kategori</span>
                <span className="font-semibold">{detailTransaction.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-semibold">{new Date(detailTransaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Jam</span>
                <span className="font-mono font-semibold">{new Date(detailTransaction.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Akun</span>
                <span className="font-semibold">
                  {wallets.find(w => w.id === detailTransaction.walletId)?.icon} {wallets.find(w => w.id === detailTransaction.walletId)?.name || 'Akun Tidak Ditemukan'}
                </span>
              </div>
            </div>
            <div className="border-t pt-3">
              <span className="text-muted-foreground text-xs font-semibold">Keterangan</span>
              <p className="mt-2 font-medium leading-relaxed">
                {detailTransaction.description || 'Tanpa Keterangan'}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default TransactionTable;