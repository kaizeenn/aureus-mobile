import React, { useState } from 'react';
import { Wallet, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Send, Zap } from 'lucide-react';

interface TransferBetweenAccountsProps {
  wallets: Wallet[];
  onTransfer: (transaction: Transaction) => void;
}

const TransferBetweenAccounts: React.FC<TransferBetweenAccountsProps> = ({
  wallets,
  onTransfer,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    description: '',
  });

  const formatRupiah = (value: string) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromWalletId || !formData.toWalletId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih akun sumber dan tujuan',
      });
      return;
    }

    if (formData.fromWalletId === formData.toWalletId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Akun sumber dan tujuan tidak boleh sama',
      });
      return;
    }

    if (!formData.amount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Masukkan jumlah transfer',
      });
      return;
    }

    const amount = Number(formData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Jumlah harus lebih besar dari 0',
      });
      return;
    }

    const sourceWallet = wallets.find((w) => w.id === formData.fromWalletId);
    if (sourceWallet && sourceWallet.balance < amount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Saldo ${sourceWallet.name} tidak cukup`,
      });
      return;
    }

    // Create transfer transaction
    const transaction: Transaction = {
      id: `transfer-${Date.now()}`,
      type: 'transfer',
      amount,
      category: 'Pemindahan Dana Antar Akun',
      description: formData.description || 'Pemindahan dana antar akun',
      date: new Date().toISOString(),
      walletId: formData.fromWalletId, // Primary wallet (from)
      fromWalletId: formData.fromWalletId,
      toWalletId: formData.toWalletId,
    };

    onTransfer(transaction);

    const fromWallet = wallets.find((w) => w.id === formData.fromWalletId);
    const toWallet = wallets.find((w) => w.id === formData.toWalletId);

    toast({
      title: 'Transfer Berhasil',
      description: `Rp ${amount.toLocaleString('id-ID')} dari ${fromWallet?.name} ke ${toWallet?.name}`,
    });

    setFormData({
      fromWalletId: '',
      toWalletId: '',
      amount: '',
      description: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Send className="h-4 w-4" />
          Pemindahan Dana Antar Akun
        </h3>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            Mulai Pemindahan
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Pemindahan Dana Antar Akun
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from-wallet">Dari Akun</Label>
            <Select value={formData.fromWalletId} onValueChange={(value) => setFormData({ ...formData, fromWalletId: value })}>
              <SelectTrigger id="from-wallet">
                <SelectValue placeholder="Pilih akun sumber" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.icon} {wallet.name} (Rp {wallet.balance.toLocaleString('id-ID')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-wallet">Ke Akun</Label>
            <Select value={formData.toWalletId} onValueChange={(value) => setFormData({ ...formData, toWalletId: value })}>
              <SelectTrigger id="to-wallet">
                <SelectValue placeholder="Pilih akun tujuan" />
              </SelectTrigger>
              <SelectContent>
                {wallets
                  .filter((w) => w.id !== formData.fromWalletId)
                  .map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.icon} {wallet.name} (Rp {wallet.balance.toLocaleString('id-ID')})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (Opsional)</Label>
            <Input
              id="description"
              placeholder="e.g., Transfer untuk pembayaran"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {formData.fromWalletId && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground mb-1">Saldo akun sumber:</p>
              <p className="font-semibold">
                {wallets.find((w) => w.id === formData.fromWalletId) && 
                  `Rp ${wallets.find((w) => w.id === formData.fromWalletId)!.balance.toLocaleString('id-ID')}`}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full gap-2">
            <Send className="h-4 w-4" />
            Pindahkan Dana
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferBetweenAccounts;
