
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { X, Square, Hash } from 'lucide-react';
import { Transaction, Wallet, Category } from '@/types';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  wallets: Wallet[];
  categories: Category[];
  selectedWalletId?: string | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onAddTransaction, 
  onClose, 
  wallets, 
  categories,
  selectedWalletId 
}) => {
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    walletId: selectedWalletId || wallets[0]?.id || '',
  });

  const formatRupiah = (value: string) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === formData.type),
    [formData.type, categories]
  );

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!formData.walletId) {
      setFormData(prev => ({
        ...prev,
        walletId: selectedWalletId || wallets[0]?.id || '',
      }));
    }
  }, [selectedWalletId, wallets, formData.walletId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.walletId) {
      toast({
        variant: "destructive",
        title: "Lengkapi form",
        description: "Jumlah, kategori, dan dompet wajib diisi.",
      });
      return;
    }

    const amount = Number(formData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Jumlah tidak valid",
        description: "Masukkan jumlah yang benar (lebih dari 0).",
      });
      return;
    }

    // KA-CHING EFFECT!
    setIsAnimating(true);

    // Use the selected date and set time to current time
    const selectedDate = new Date(formData.date);
    const now = new Date();
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    // Delay actual submit to show animation
    setTimeout(() => {
      onAddTransaction({
        type: formData.type,
        amount,
        category: formData.category,
        description: formData.description,
        date: selectedDate.toISOString(),
        walletId: formData.walletId,
      });

      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        walletId: selectedWalletId || wallets[0]?.id || '',
      });
      setIsAnimating(false);
    }, 1200);
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-foreground font-medium">Tanggal *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="neumorphic-inset mt-1.5"
              />
            </div>

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
              <Label htmlFor="wallet" className="text-foreground font-medium">Sumber Dana (Dompet) *</Label>
              <Select
                value={formData.walletId}
                onValueChange={(value) => setFormData({ ...formData, walletId: value })}
                disabled={wallets.length === 0}
              >
                <SelectTrigger className="neumorphic-inset mt-1.5">
                  <SelectValue placeholder="Pilih dompet..." />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <span className="flex items-center gap-2">
                        <span>{wallet.icon}</span>
                        <span>{wallet.name}</span>
                      </span>
                    </SelectItem>
                  ))}
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
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <span className="flex items-center gap-2">
                        {category.icon} {category.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="text-foreground font-medium">Jumlah (Rp) *</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatRupiah(formData.amount)}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, amount: digitsOnly });
                }}
                required
                className="neumorphic-inset mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground font-medium">Keterangan (Opsional)</Label>
              <Textarea
                id="description"
                placeholder="Masukkan keterangan transaksi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
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

      {/* Ka-ching Coins Overlay */}
      {isAnimating && (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden flex justify-center">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-400 animate-coin-drop"
              style={{
                left: `${Math.random() * 100}%`,
                top: -50,
                animationDuration: `${0.5 + Math.random() * 1}s`,
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: `${20 + Math.random() * 30}px`,
              }}
            >
              $
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionForm;
