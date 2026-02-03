import React from 'react';
import { Transaction } from '@/pages/Index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TransactionSummaryProps {
  transactions: Transaction[];
  isAllTime: boolean;
  setIsAllTime: (val: boolean) => void;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions, isAllTime, setIsAllTime }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split('T')[0];

  // Daily Stats
  const todayTransactions = transactions.filter(t => 
    t.date.split('T')[0] === currentDate
  );
  
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayNet = todayIncome - todayExpense;

  // Monthly Stats
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const monthlyIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpense = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyNet = monthlyIncome - monthlyExpense;

  // All Time Stats
  const allIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const allExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const allNet = allIncome - allExpense;

  return (
    <Card className={cn(
        "transition-all duration-500 ease-in-out", 
        isAllTime ? "border-primary shadow-lg scale-[1.02]" : ""
    )}>
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
            Ringkasan {isAllTime ? "" : ""}
        </CardTitle>
        <Button 
            variant={isAllTime ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAllTime(!isAllTime)}
            className="h-8 text-xs gap-2 transition-all"
        >
            <Infinity className="h-3 w-3" />
            {isAllTime ? "Kembali" : "All-Time"}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Animated Grid Container */}
        <div className={cn(
            "grid gap-3 transition-all duration-500 ease-in-out",
            isAllTime ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        )}>
          
          {/* Card 1: Hari Ini OR All-Time Main */}
          <div className={cn(
              "rounded-lg border bg-card p-4 transition-all duration-500",
              isAllTime ? "bg-gradient-to-br from-primary/10 to-transparent border-primary/20" : ""
          )}>
            <div className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground flex justify-between items-center">
              {isAllTime ? "Total Akumulasi" : "Hari ini"}
              {isAllTime && <Infinity className="h-3 w-3 text-primary/50" />}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                  Masuk
                </span>
                <span className="font-semibold tabular-nums text-lg">
                  Rp {(isAllTime ? allIncome : todayIncome).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                  Keluar
                </span>
                <span className="font-semibold tabular-nums text-lg">
                  Rp {(isAllTime ? allExpense : todayExpense).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t pt-3 border-dashed border-primary/20">
                <span className="text-sm font-semibold">Saldo</span>
                <span className={cn(
                    "font-bold tabular-nums text-xl",
                    (isAllTime ? allNet : todayNet) < 0 ? "text-destructive" : "text-primary"
                )}>
                  {(isAllTime ? allNet : todayNet) < 0 && '-'}Rp {Math.abs(isAllTime ? allNet : todayNet).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Bulan Ini - Hidden/Collapsed when All-Time is active */}
          <div className={cn(
              "rounded-lg border bg-card p-4 transition-all duration-500 overflow-hidden",
              isAllTime ? "h-0 p-0 border-0 opacity-0 scale-95" : "h-auto opacity-100 scale-100"
          )}>
            <div className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">
              Bulan ini
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                  Masuk
                </span>
                <span className="font-semibold tabular-nums">
                  Rp {monthlyIncome.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                  Keluar
                </span>
                <span className="font-semibold tabular-nums">
                  Rp {monthlyExpense.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t pt-3">
                <span className="text-sm font-semibold">Saldo</span>
                <span className="font-semibold tabular-nums">
                  {monthlyNet < 0 && '-'}Rp {Math.abs(monthlyNet).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionSummary;