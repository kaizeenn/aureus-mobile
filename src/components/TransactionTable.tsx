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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import { Transaction } from '@/pages/Index';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  selectedMonth: number;
  selectedYear: number;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onDeleteTransaction,
  selectedMonth,
  selectedYear
}) => {
  const [showIncome, setShowIncome] = useState(true);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // Filter transactions by selected month and year
  const monthlyTransactions = transactions.filter(transaction => {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const toggleTransactionType = () => {
    setShowIncome(!showIncome);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {showIncome ? (
              <ArrowUp className="h-5 w-5 text-success" />
            ) : (
              <ArrowDown className="h-5 w-5 text-destructive" />
            )}
            {showIncome ? 'Pemasukan' : 'Pengeluaran'}
          </CardTitle>

          <ToggleGroup
            type="single"
            value={showIncome ? 'income' : 'expense'}
            onValueChange={(v) => {
              if (!v) return;
              setShowIncome(v === 'income');
            }}
          >
            <ToggleGroupItem value="income" aria-label="Tampilkan pemasukan">
              Masuk
            </ToggleGroupItem>
            <ToggleGroupItem value="expense" aria-label="Tampilkan pengeluaran">
              Keluar
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mt-2">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground">
            Total
          </div>
          <div
            className={cn(
              "text-2xl font-bold tabular-nums",
              showIncome ? "text-success" : "text-destructive"
            )}
          >
            Rp {totalAmount.toLocaleString('id-ID')}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <div className="mb-3">
              {showIncome ? (
                <ArrowUp className="h-10 w-10 mx-auto text-muted-foreground/40" />
              ) : (
                <ArrowDown className="h-10 w-10 mx-auto text-muted-foreground/40" />
              )}
            </div>
            <p className="text-sm font-medium">
              Belum ada {showIncome ? 'pemasukan' : 'pengeluaran'} pada periode ini.
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Tambahkan transaksi untuk mulai melihat statistik.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 sm:px-4">Jumlah</TableHead>
                  <TableHead className="px-2 sm:px-4">Keterangan</TableHead>
                  <TableHead className="hidden px-2 sm:table-cell sm:px-4">Kategori</TableHead>
                  <TableHead className="w-20 px-2 sm:px-4">Tanggal</TableHead>
                  <TableHead className="w-14 px-2 text-right sm:px-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() =>
                      setSelectedRow(
                        selectedRow === transaction.id ? null : transaction.id
                      )
                    }
                  >
                    <TableCell className="px-2 sm:px-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={transaction.type === 'income' ? 'default' : 'destructive'}
                          className="h-2 w-2 p-0"
                        />
                        <span
                          className={cn(
                            "font-semibold text-xs sm:text-sm tabular-nums",
                            transaction.type === 'income'
                              ? 'text-success'
                              : 'text-destructive'
                          )}
                        >
                          Rp {transaction.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 text-xs sm:px-4 sm:text-sm">
                      <div className="max-w-[220px]">
                        <div
                          className={cn(
                            "truncate",
                            selectedRow === transaction.id && transaction.description?.length > 28
                              ? "animate-[scroll_3s_linear_infinite] whitespace-nowrap"
                              : ""
                          )}
                          title={transaction.description}
                          style={{
                            animation:
                              selectedRow === transaction.id &&
                              transaction.description &&
                              transaction.description.length > 28
                                ? 'scroll 3s linear infinite'
                                : 'none',
                          }}
                        >
                          {transaction.description || 'Tidak ada keterangan'}
                        </div>
                        <div className="sm:hidden mt-1">
                          <Badge variant="outline" className="text-[11px]">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-2 sm:table-cell sm:px-4">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 text-xs sm:px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold">{formatDate(transaction.date)}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(transaction.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 text-right sm:px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Yakin ingin menghapus transaksi ini?')) {
                            onDeleteTransaction(transaction.id);
                          }
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Hapus transaksi"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
