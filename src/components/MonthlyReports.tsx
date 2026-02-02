
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Square, ArrowUp, ArrowDown, File } from 'lucide-react';
import { Transaction } from '@/pages/Index';

interface MonthlyReportsProps {
  transactions: Transaction[];
}

const MonthlyReports: React.FC<MonthlyReportsProps> = ({ transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const availableYears = Array.from(
    new Set(transactions.map(t => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a);

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

  const downloadCSV = () => {
    const csvData = [
      ['Laporan Bulanan', `${months[selectedMonth]} ${selectedYear}`],
      [''],
      ['Ringkasan'],
      ['Pemasukan', `Rp ${income.toLocaleString('id-ID')}`],
      ['Pengeluaran', `Rp ${expense.toLocaleString('id-ID')}`],
      ['Saldo', `Rp ${Math.abs(net).toLocaleString('id-ID')}${net < 0 ? ' (-)' : ''}`],
      [''],
      ['Detail Transaksi'],
      ['Tanggal', 'Jenis', 'Jumlah', 'Kategori', 'Keterangan'],
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString('id-ID'),
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        `Rp ${t.amount.toLocaleString('id-ID')}`,
        t.category,
        t.description || 'Tidak ada keterangan'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-${months[selectedMonth]}-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
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
    <div className="neumorphic-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2  bg-primary/10">
            <File className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Laporan Bulanan</h3>
        </div>
      </div>
      
      {/* Month/Year Selector and Export Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
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

        <div className="flex gap-2 ml-auto">
          <Button 
            onClick={downloadCSV} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 transition-smooth hover:scale-105"
          >
            <ArrowDown className="h-4 w-4" />
            CSV
          </Button>
          <Button 
            onClick={downloadPDF} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 transition-smooth hover:scale-105"
          >
            <ArrowDown className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income Card */}
          <div className="p-4  bg-success/5 border border-success/10 transition-smooth hover:scale-105">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Pemasukan</span>
            </div>
            <div className="text-2xl font-bold text-success">
              Rp {income.toLocaleString('id-ID')}
            </div>
          </div>
          
          {/* Expense Card */}
          <div className="p-4  bg-destructive/5 border border-destructive/10 transition-smooth hover:scale-105">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Pengeluaran</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              Rp {expense.toLocaleString('id-ID')}
            </div>
          </div>
          
          {/* Balance Card */}
          <div className={`p-4  border transition-smooth hover:scale-105 ${
            net >= 0 
              ? 'bg-primary/5 border-primary/10' 
              : 'bg-destructive/5 border-destructive/10'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Square className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Saldo</span>
            </div>
            <div className={`text-2xl font-bold ${
              net >= 0 ? 'text-primary' : 'text-destructive'
            }`}>
              {net < 0 && '-'}Rp {Math.abs(net).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
        
        {/* Transaction Count */}
        <div className="text-center py-3 px-4  bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Total <span className="font-semibold text-foreground">{filteredTransactions.length}</span> transaksi pada{' '}
            <span className="font-semibold text-foreground">{months[selectedMonth]} {selectedYear}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReports;
