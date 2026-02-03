
import React from 'react';
import { Transaction } from '@/pages/Index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split('T')[0];

  const todayTransactions = transactions.filter(t => 
    t.date.split('T')[0] === currentDate
  );
  
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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

  const todayNet = todayIncome - todayExpense;
  const monthlyNet = monthlyIncome - monthlyExpense;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Ringkasan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">
              Hari ini
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                  Masuk
                </span>
                <span className="font-semibold tabular-nums">
                  Rp {todayIncome.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                  Keluar
                </span>
                <span className="font-semibold tabular-nums">
                  Rp {todayExpense.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t pt-3">
                <span className="text-sm font-semibold">Saldo</span>
                <span className="font-semibold tabular-nums">
                  {todayNet < 0 && '-'}Rp {Math.abs(todayNet).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
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
