
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { X, Square, Hash } from 'lucide-react';
import { Transaction } from '@/pages/Index';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
  });

  const categories = {
    expense: [
      'Makanan & Minuman',
      'Transportasi',
      'Belanja',
      'Tagihan',
      'Kesehatan',
      'Hiburan',
      'Pendidikan',
      'Rumah Tangga',
      'Komunikasi',
      'Lainnya'
    ],
    income: [
      'Gaji',
      'Bonus',
      'Penjualan',
      'Investasi',
      'Freelance',
      'Pemasukan Lain'
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        variant: "destructive",
        title: "Lengkapi form",
        description: "Jumlah, kategori, dan keterangan wajib diisi.",
      });
      return;
    }

    const amount = Number.parseFloat(formData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Jumlah tidak valid",
        description: "Masukkan jumlah yang benar (lebih dari 0).",
      });
      return;
    }

    onAddTransaction({
      type: formData.type,
      amount,
      category: formData.category,
      description: formData.description,
      date: new Date().toISOString(),
    });

    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
    });
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return today.toLocaleDateString('id-ID', options);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-row items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Tambah Transaksi
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className=" h-8 w-8 p-0 hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          {/* Tanggal Hari Ini */}
          <div className="rounded-lg border bg-primary/5 border-primary/20 p-3">
            <div className="flex items-center gap-2 text-primary">
              <Square className="h-4 w-4" />
              <span className="text-sm font-medium">{getCurrentDate()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="type" className="text-foreground font-medium">Tipe Transaksi *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData({ ...formData, type: value, category: '' })
                }
              >
                <SelectTrigger className="neumorphic-inset mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="text-foreground font-medium">Kategori *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="neumorphic-inset mt-1.5">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {categories[formData.type].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="text-foreground font-medium">Jumlah (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="neumorphic-inset mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground font-medium">Keterangan *</Label>
              <Textarea
                id="description"
                placeholder="Masukkan keterangan transaksi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                className="neumorphic-inset mt-1.5 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 neumorphic-card hover:brightness-110 transition-all">
                Simpan Transaksi
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="neumorphic-flat">
                Batal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
