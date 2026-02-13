import React, { useRef } from 'react';
import { Wallet, Transaction, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download, Upload } from 'lucide-react';
import { downloadBackup, createBackup, importFromJson } from '@/lib/backup';

interface BackupRestoreProps {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  onRestore: (wallets: Wallet[], transactions: Transaction[], categories: Category[]) => void;
}

const BackupRestore: React.FC<BackupRestoreProps> = ({
  wallets,
  transactions,
  categories,
  onRestore,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const backup = createBackup(wallets, transactions, categories);
    const success = await downloadBackup(backup);
    
    if (success !== false) {
      toast({
        title: 'Berhasil',
        description: 'File backup siap disimpan. Pilih lokasi penyimpanan.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyimpan file backup',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const backup = importFromJson(content);

      if (!backup) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'File backup tidak valid',
        });
        return;
      }

      // Confirm before restoring
      if (window.confirm('Apakah Anda yakin ingin mengembalikan data dari backup ini? Data saat ini akan diganti.')) {
        onRestore(backup.wallets, backup.transactions, backup.categories);
        toast({
          title: 'Berhasil',
          description: 'Data telah dipulihkan dari backup',
        });
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Cadangkan semua data Anda (akun, transaksi, kategori) dan pulihkan kapan saja.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Ekspor Data</h3>
        <Button onClick={handleExport} className="w-full gap-2" variant="default">
          <Download className="h-4 w-4" />
          Unduh sebagai JSON
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Impor Data</h3>
        <Button onClick={handleImportClick} className="w-full gap-2" variant="outline">
          <Upload className="h-4 w-4" />
          Pilih File JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-xs text-yellow-900 dark:text-yellow-100">
          ⚠️ Memulihkan dari backup akan mengganti semua data saat ini. Pastikan Anda telah membuat backup sebelumnya.
        </p>
      </div>
    </div>
  );
};

export default BackupRestore;
