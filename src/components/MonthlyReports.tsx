
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Square, ArrowUp, ArrowDown, File } from 'lucide-react';
import { Transaction } from '@/pages/Index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toast } from '@/components/ui/use-toast';

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
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

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

  const downloadCSV = async () => {
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
    const fileName = `laporan-${months[selectedMonth]}-${selectedYear}.csv`;

    try {
      if (Capacitor.isNativePlatform()) {
        // Mobile Logic: Write to filesystem then share
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        await Share.share({
          title: 'Ekspor Laporan Keuangan',
          text: `Laporan keuangan bulan ${months[selectedMonth]} ${selectedYear}`,
          url: result.uri,
          dialogTitle: 'Bagikan CSV',
        });
      } else {
        // Web Logic: Blob download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Gagal Mengekspor",
        description: "Terjadi kesalahan saat menyimpan file.",
        variant: "destructive"
      });
    }
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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <File className="h-5 w-5 text-primary" />
            Laporan Bulanan
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[120px]">
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

          <div className="ml-auto flex gap-2">
            <Button onClick={downloadCSV} variant="outline" size="sm" className="gap-2">
              <ArrowDown className="h-4 w-4" />
              CSV
            </Button>
            <Button onClick={downloadPDF} variant="outline" size="sm" className="gap-2">
              <ArrowDown className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUp className="h-4 w-4 text-success" />
              Pemasukan
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-success">
              Rp {income.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowDown className="h-4 w-4 text-destructive" />
              Pengeluaran
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-destructive">
              Rp {expense.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Square className="h-4 w-4 text-primary" />
              Saldo
            </div>
            <div className={`mt-2 text-2xl font-bold tabular-nums ${net >= 0 ? 'text-foreground' : 'text-destructive'}`}>
              {net < 0 && '-'}Rp {Math.abs(net).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Total <span className="font-semibold text-foreground">{filteredTransactions.length}</span> transaksi pada{' '}
          <span className="font-semibold text-foreground">{months[selectedMonth]} {selectedYear}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyReports;
