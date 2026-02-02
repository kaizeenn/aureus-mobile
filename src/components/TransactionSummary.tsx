
import React from 'react';
import { Transaction } from '@/pages/Index';

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
    <div className="grid grid-cols-2 gap-3">
      <div className="neumorphic-card p-3 border-2 border-foreground">
        <div className="text-xs text-muted-foreground mb-2">HARI INI</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Masuk</span>
            <span className="font-bold">{todayIncome.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Keluar</span>
            <span className="font-bold">{todayExpense.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1">
            <span className="font-bold">Saldo</span>
            <span className="font-bold">{todayNet < 0 && '-'}{Math.abs(todayNet).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="neumorphic-card p-3 border-2 border-foreground">
        <div className="text-xs text-muted-foreground mb-2">BULAN INI</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Masuk</span>
            <span className="font-bold">{monthlyIncome.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Keluar</span>
            <span className="font-bold">{monthlyExpense.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1">
            <span className="font-bold">Saldo</span>
            <span className="font-bold">{monthlyNet < 0 && '-'}{Math.abs(monthlyNet).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
