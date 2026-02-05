
import React from 'react';
import { Button } from '@/components/ui/button';
import { Square, ArrowUp, ArrowDown, Printer } from 'lucide-react';
import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyReportsProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  months: string[];
}

const MonthlyReports: React.FC<MonthlyReportsProps> = ({ transactions, selectedMonth, selectedYear, months }) => {
  
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const net = income - expense;

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Laporan Bulanan ${months[selectedMonth]} ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; }
            .summary-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
            .income { background-color: #d4edda; }
            .expense { background-color: #f8d7da; }
            .balance { background-color: #d1ecf1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Bulanan</h1>
            <h2>${months[selectedMonth]} ${selectedYear}</h2>
          </div>
          
          <div class="summary">
            <h3>Ringkasan</h3>
            <div class="summary-item income">
              <strong>Pemasukan: Rp ${income.toLocaleString('id-ID')}</strong>
            </div>
            <div class="summary-item expense">
              <strong>Pengeluaran: Rp ${expense.toLocaleString('id-ID')}</strong>
            </div>
            <div class="summary-item balance">
              <strong>Saldo: Rp ${Math.abs(net).toLocaleString('id-ID')}${net < 0 ? ' (-)' : ''}</strong>
            </div>
          </div>

          <h3>Detail Transaksi (${filteredTransactions.length} transaksi)</h3>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Kategori</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString('id-ID')}</td>
                  <td>${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                  <td>Rp ${t.amount.toLocaleString('id-ID')}</td>
                  <td>${t.category}</td>
                  <td>${t.description || 'Tidak ada keterangan'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Laporan Bulanan</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo = Pemasukan − Pengeluaran
            </p>
          </div>
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Cetak
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-success/10 p-3 text-center border border-success/20">
            <div className="text-xs font-medium text-muted-foreground mb-1">PEMASUKAN</div>
            <div className="text-lg font-bold text-success">
              Rp {income.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className="rounded-lg bg-destructive/10 p-3 text-center border border-destructive/20">
            <div className="text-xs font-medium text-muted-foreground mb-1">PENGELUARAN</div>
            <div className="text-lg font-bold text-destructive">
              Rp {expense.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className={`rounded-lg p-3 text-center border ${
            net >= 0 
              ? 'bg-primary/10 border-primary/20' 
              : 'bg-destructive/10 border-destructive/20'
          }`}>
            <div className="text-xs font-medium text-muted-foreground mb-1">SALDO BERSIH</div>
            <div className={`text-lg font-bold ${net >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {net < 0 && '-'}Rp {Math.abs(net).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center text-sm text-muted-foreground pt-2 border-t">
          <span className="font-medium text-foreground">{filteredTransactions.length}</span> transaksi pada <span className="font-medium text-foreground">{months[selectedMonth]} {selectedYear}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyReports;
