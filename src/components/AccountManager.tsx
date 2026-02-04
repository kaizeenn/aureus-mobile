import React, { useState } from 'react';
import { Wallet } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit2, CreditCard } from 'lucide-react';

interface AccountManagerProps {
  wallets: Wallet[];
  selectedWalletId: string | null;
  onAddWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string) => void;
  onSelectWallet: (id: string) => void;
}

const BANK_OPTIONS = [
  { label: 'Dana', value: 'dana' },
  { label: 'BCA', value: 'bca' },
  { label: 'Mandiri', value: 'mandiri' },
  { label: 'BNI', value: 'bni' },
  { label: 'BRI', value: 'bri' },
  { label: 'OVO', value: 'ovo' },
  { label: 'GCash', value: 'gcash' },
  { label: 'Tunai', value: 'cash' },
];

const WALLET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#AA96DA', '#FCBAD3', '#A8D8EA', '#FFB6B9', '#1F9FFF'
];

const WALLET_ICONS = ['💵', '💳', '🏦', '📲', '💰', '🪙', '💎', '🎫'];

const AccountManager: React.FC<AccountManagerProps> = ({
  wallets,
  selectedWalletId,
  onAddWallet,
  onDeleteWallet,
  onSelectWallet,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'cash' | 'bank' | 'digital',
    bankName: '',
    color: WALLET_COLORS[0],
    icon: WALLET_ICONS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Nama akun wajib diisi',
      });
      return;
    }

    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      bankName: formData.bankName || undefined,
      balance: 0,
      currency: 'IDR',
      color: formData.color,
      icon: formData.icon,
      createdAt: new Date().toISOString(),
    };

    onAddWallet(newWallet);
    setFormData({
      name: '',
      type: 'bank',
      bankName: '',
      color: WALLET_COLORS[0],
      icon: WALLET_ICONS[0],
    });
    setOpen(false);

    toast({
      title: 'Berhasil',
      description: `Akun ${newWallet.name} telah ditambahkan`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Akun Saya
        </h2>
      </div>

      {/* Wallet List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            onClick={() => onSelectWallet(wallet.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedWalletId === wallet.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 bg-card'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{wallet.name}</p>
                  {wallet.bankName && <p className="text-xs text-muted-foreground">{wallet.bankName}</p>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteWallet(wallet.id);
                  toast({
                    title: 'Berhasil',
                    description: `Akun ${wallet.name} telah dihapus`,
                  });
                }}
                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-lg font-bold">Rp {wallet.balance.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Tambah Akun
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Akun Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Nama Akun</Label>
              <Input
                id="wallet-name"
                placeholder="e.g., BCA Utama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-type">Tipe Akun</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="wallet-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="digital">Dompet Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.type === 'bank' || formData.type === 'digital') && (
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nama Bank/Aplikasi</Label>
                <Select value={formData.bankName} onValueChange={(value) => setFormData({ ...formData, bankName: value })}>
                  <SelectTrigger id="bank-name">
                    <SelectValue placeholder="Pilih bank/aplikasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {WALLET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-2 text-2xl rounded border-2 transition-all ${
                      formData.icon === icon ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="grid grid-cols-5 gap-2">
                {WALLET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 rounded border-2 transition-all ${
                      formData.color === color ? 'border-foreground ring-2 ring-offset-2' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Tambah Akun
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountManager;
